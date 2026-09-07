import asyncio
import json
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[1] / 'src' / 'scripts'
sys.path.insert(0, str(SCRIPTS))
from completion import CompletionEngine, _rule_names, utf16_position
from lsprotocol.types import (
    ClientCapabilities, CompletionParams,
    InitializeParams, Position, TextDocumentContentChangeEvent_Type2,
    TextDocumentIdentifier, TextDocumentItem, VersionedTextDocumentIdentifier,
)
from pygls.server import LanguageServer


GRAMMAR = r"""Model: commands*=Command;
Command: 'move' ('to' | 'by') x=INT | 'stop';
Comment: /\/\/.*$/;
"""


class CompletionTests(unittest.TestCase):
    def setUp(self):
        self.engine = CompletionEngine()

    def items(self, source, grammar=GRAMMAR, language='demo', cursor=None):
        cursor = len(source) if cursor is None else cursor
        return self.engine.complete(language, source, grammar, *utf16_position(source, cursor))

    def labels(self, *args, **kwargs):
        return {item['label'] for item in self.items(*args, **kwargs)}

    def test_alternatives_and_partial_words(self):
        self.assertEqual(self.labels('move '), {'to', 'by'})
        self.assertEqual(self.labels('move t'), {'to'})
        self.assertTrue(all(not x['fallback'] for x in self.items('move ')))

    def test_empty_valid_and_repeated_prefixes(self):
        for source in ['', 'stop ', 'move to 1 ', 'stop\n']:
            with self.subTest(source=source):
                self.assertEqual(self.labels(source), {'move', 'stop'})

    def test_optional_and_punctuation(self):
        grammar = "Model: 'begin' ('extra')? ';';"
        self.assertEqual(self.labels('begin ', grammar), {'extra', ';'})
        item = next(x for x in self.items('begin ;', grammar, cursor=6) if x['label'] == ';')
        self.assertEqual(item['start'], item['end'])
        self.assertEqual(item['start'], (0, 6))

    def test_replaces_entire_word_without_touching_suffix(self):
        items = self.items('move toast 12', cursor=6)
        self.assertEqual(items[0]['label'], 'to')
        self.assertEqual(items[0]['start'], (0, 5))
        self.assertEqual(items[0]['end'], (0, 10))

    def test_earlier_error_uses_filtered_fallback(self):
        items = self.items('broken move t')
        self.assertEqual({x['label'] for x in items}, {'to'})
        self.assertTrue(all(x['fallback'] for x in items))

    def test_consumed_sentinel_uses_fallback(self):
        items = self.items('', "Model: /.*/ ('tail')?;")
        self.assertEqual({x['label'] for x in items}, {'tail'})
        self.assertTrue(all(x['fallback'] for x in items))

    def test_regex_rules_are_not_inserted(self):
        self.assertEqual(self.labels('', 'Model: value=ID;'), set())
        self.assertEqual(self.labels('', 'Model: value=INT;'), set())

    def test_comments_and_literal_decoding(self):
        grammar = '''Model: ('go' | 'go' | 'a\\\'b')*; Comment: 'IGNORE' /[^\\n]*/;'''
        self.assertEqual(self.labels('broken ', grammar), {'go', "a'b"})
        self.assertEqual(self.labels('// hello\n'), {'move', 'stop'})

    def test_invalid_grammar_recovery_and_switching(self):
        self.assertEqual(self.labels('', ''), set())
        self.assertEqual(self.labels('', 'Model:'), set())
        self.assertEqual(self.labels(''), {'move', 'stop'})
        self.assertEqual(self.labels('', "Model: 'different';"), {'different'})
        self.assertEqual(self.labels(''), {'move', 'stop'})
        self.assertEqual(self.labels('', 'import absent\nModel: ID;'), set())

    def test_grammar_completion_while_invalid(self):
        self.assertEqual(self.labels('Root: name=I', language='textx'), {'ID', 'INT'})
        items = self.items('Thing: ID;\nRoot: value=Th', language='textx')
        self.assertEqual({x['label'] for x in items}, {'Thing'})
        self.assertFalse(items[0]['fallback'])
        self.assertTrue(items[0]['rule_name'])

    def test_tolerant_rule_declarations(self):
        source = '''Thing[skipws]: 'Fake: ID;';
        Other: /Regex: ID;/;
        // Hidden: ID;
        /* Gone: ID; */
        Last: "Unfinished: ID;
        '''
        self.assertEqual(_rule_names(source), {'Thing', 'Other', 'Last'})

    def test_utf16_multiline_and_crlf(self):
        for source in ['// 😀\nmove t', '// 😀\r\nmove t']:
            item = self.items(source)[0]
            self.assertEqual(item['start'], (1, 5))
            self.assertEqual(item['end'], (1, 6))
        item = self.items('"😀" move t', 'Model: STRING \'move\' \'to\';')[0]
        self.assertEqual(item['start'], (0, 10))
        self.assertEqual(item['end'], (0, 11))

    def test_form_feed_in_string_is_not_a_document_newline(self):
        item = self.items('"a\fb" move t', 'Model: STRING \'move\' \'to\';')[0]
        self.assertEqual(item['label'], 'to')
        self.assertEqual(item['start'], (0, 11))
        self.assertEqual(item['end'], (0, 12))


class ProtocolTests(unittest.TestCase):
    def setUp(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.grammar_uri = 'inmemory://model/1'
        self.model_uri = 'inmemory://model/2'
        js = types.ModuleType('js')
        js.GRAMMAR_DOC_URI, js.MODEL_DOC_URI = self.grammar_uri, self.model_uri
        self.namespace = {}
        # Mirror runPythonAsync: execute the helper, then the server in one namespace.
        exec(compile((SCRIPTS / 'completion.py').read_text(), 'completion.py', 'exec'), self.namespace)
        with patch.dict(sys.modules, {'js': js}), patch.object(LanguageServer, 'start_pyodide'):
            exec(compile((SCRIPTS / 'textxServer.py').read_text(), 'textxServer.py', 'exec'), self.namespace)
        self.server = self.namespace['server']
        self.initialized = self.server.lsp.lsp_initialize(InitializeParams(capabilities=ClientCapabilities()))
        for uri, lang, source in [(self.grammar_uri, 'textx', GRAMMAR), (self.model_uri, 'demo', 'move t')]:
            self.server.workspace.put_text_document(TextDocumentItem(uri=uri, language_id=lang, version=1, text=source))

    def tearDown(self):
        self.server.loop.close()
        self.loop.close()
        asyncio.set_event_loop(None)

    def request(self, uri, line, character):
        return self.namespace['complete'](self.server, CompletionParams(
            text_document=TextDocumentIdentifier(uri=uri), position=Position(line, character)))

    def test_advertises_completion(self):
        self.assertIsNotNone(self.initialized.capabilities.completion_provider)
        self.assertFalse(self.initialized.capabilities.completion_provider.resolve_provider)

    def test_serialization_and_no_document_or_diagnostic_mutation(self):
        with patch.object(self.server, 'publish_diagnostics') as publish:
            result = self.request(self.model_uri, 0, 6)
            payload = json.loads(json.dumps(result, default=self.server.lsp._serialize_message))
            self.assertEqual(payload['items'][0]['label'], 'to')
            self.assertEqual(payload['items'][0]['textEdit']['range']['start'], {'line': 0, 'character': 5})
            self.assertTrue(payload['isIncomplete'])
            self.assertEqual(self.server.workspace.get_text_document(self.model_uri).source, 'move t')
            publish.assert_not_called()
        grammar = self.request(self.grammar_uri, 0, 0)
        self.assertIn('import', {x.label for x in grammar.items})
        self.assertEqual(self.request('inmemory://missing', 0, 0).items, [])

    def test_uses_latest_workspace_grammar(self):
        self.server.workspace.update_text_document(
            VersionedTextDocumentIdentifier(uri=self.grammar_uri, version=2),
            TextDocumentContentChangeEvent_Type2(text="Model: 'new';"))
        result = self.request(self.model_uri, 0, 0)
        self.assertEqual({x.label for x in result.items}, {'new'})


if __name__ == '__main__':
    unittest.main()
