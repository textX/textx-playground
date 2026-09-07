from lsprotocol.types import (TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_CLOSE, TEXT_DOCUMENT_DID_OPEN, Diagnostic, DiagnosticSeverity, Position, Range)
from pygls.server import LanguageServer
from textx import metamodel_from_str, exceptions

from js import GRAMMAR_DOC_URI, MODEL_DOC_URI
from lsprotocol.types import (TEXT_DOCUMENT_COMPLETION, CompletionOptions,
    CompletionList, CompletionItem, CompletionItemKind, TextEdit)


server = LanguageServer('textx-ls', '0.0.1')
# textxWorker.ts executes completion.py in this namespace before this script.
completion_engine = CompletionEngine()


@server.feature(TEXT_DOCUMENT_COMPLETION, CompletionOptions(resolve_provider=False))
def complete(ls, params):
    docs = ls.workspace.text_documents
    document = docs.get(params.text_document.uri)
    if document is None:
        return CompletionList(is_incomplete=True, items=[])
    grammar = docs.get(GRAMMAR_DOC_URI)
    try:
        candidates = completion_engine.complete(
            document.language_id, document.source,
            grammar.source if grammar else '',
            params.position.line, params.position.character)
        items = [CompletionItem(
            label=item['label'],
            kind=CompletionItemKind.Class if item['rule_name'] else CompletionItemKind.Keyword,
            detail='Grammar vocabulary' if item['fallback'] else 'Expected syntax',
            sort_text=('1' if item['fallback'] else '0') + item['label'],
            text_edit=TextEdit(
                range=Range(start=Position(*item['start']), end=Position(*item['end'])),
                new_text=item['label'])) for item in candidates]
        return CompletionList(is_incomplete=True, items=items)
    except Exception as error:
        ls.show_message_log(f'Completion failed: {type(error).__name__}: {error}')
        return CompletionList(is_incomplete=True, items=[])

@server.feature(TEXT_DOCUMENT_DID_CHANGE)
def did_change(ls, params):
    validate(ls, params)


@server.feature(TEXT_DOCUMENT_DID_OPEN)
def did_open(ls, params):
    validate(ls, params) 


def validate(ls, params):
    text_doc = ls.workspace.get_text_document(params.text_document.uri)
    grammar_diagnostics = []
    model_diagnostics = []

    docs = ls.workspace.text_documents
    
    if len(docs) < 2:
        return
    
    grammar_doc = None
    model_doc = None

    if text_doc.language_id == 'textx':
        grammar_doc = text_doc
        model_doc = docs[MODEL_DOC_URI]
    else:
        grammar_doc = docs[GRAMMAR_DOC_URI]
        model_doc = text_doc

    if not grammar_doc.source:
        ls.show_message_log('Metamodel is empty')
        ls.publish_diagnostics(grammar_doc.uri, grammar_diagnostics)
        ls.publish_diagnostics(model_doc.uri, model_diagnostics)
        return

    metamodel = None
    
    try:
        metamodel = metamodel_from_str(grammar_doc.source)
    except exceptions.TextXError as err:
        grammar_diagnostics.append(Diagnostic(
            range=Range(
                start=Position(line=err.line - 1, character=err.col - 1),
                end=Position(line=err.line - 1, character=err.col)
            ),
            message=err.message,
            severity=DiagnosticSeverity.Error,
            source=type(server).__name__))
        ls.publish_diagnostics(grammar_doc.uri, grammar_diagnostics)
        ls.publish_diagnostics(model_doc.uri, model_diagnostics)
        return

    try:        
        metamodel.model_from_str(model_doc.source)
    except exceptions.TextXError as err:
        model_diagnostics.append(Diagnostic(
            range=Range(
                start=Position(line=err.line - 1, character=err.col - 1),
                end=Position(line=err.line - 1, character=err.col)
            ),
            message=err.message,
            severity=DiagnosticSeverity.Error,
            source=type(server).__name__))
        ls.publish_diagnostics(grammar_doc.uri, grammar_diagnostics)
        ls.publish_diagnostics(model_doc.uri, model_diagnostics)
        return
    
    ls.publish_diagnostics(grammar_doc.uri, grammar_diagnostics)
    ls.publish_diagnostics(model_doc.uri, model_diagnostics)


server.start_pyodide()
