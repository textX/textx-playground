"""Parser-informed completion, independent of the browser and LSP transport."""

import re
from functools import lru_cache
from pathlib import Path

from arpeggio import StrMatch
from textx import get_children_of_type, metamodel_for_language, metamodel_from_str
from textx.exceptions import TextXError, TextXSyntaxError
from textx.lang import BASE_TYPE_NAMES


def utf16_offset(source, line, character):
    # Monaco documents use LF or CRLF. splitlines() also splits on characters
    # such as form-feed inside a DSL string, corrupting LSP cursor offsets.
    lines = source.split('\n')
    if line < 0 or character < 0:
        raise ValueError("Negative document position")
    if line >= len(lines):
        return len(source)
    start = sum(len(value) + 1 for value in lines[:line])
    units = 0
    for index, char in enumerate(lines[line].rstrip('\r\n')):
        width = len(char.encode('utf-16-le')) // 2
        if units + width > character:
            return start + index
        units += width
    return start + len(lines[line].rstrip('\r\n'))


def utf16_position(source, offset):
    prefix = source[:offset]
    return (prefix.count('\n'), len(prefix.rsplit('\n', 1)[-1].encode('utf-16-le')) // 2)


def _word_char(char):
    return char == '_' or char.isalnum()


def _rule_names(source):
    # Mask even unterminated strings, comments and regexes during editing.
    opaque = re.compile(r'''//[^\n]*|/\*[\s\S]*?(?:\*/|$)|"(?:\\.|[^"\\])*(?:"|$)|'(?:\\.|[^'\\])*(?:'|$)|/(?:\\.|[^/\\])*(?:/|$)''')
    masked = opaque.sub(lambda m: ''.join('\n' if c == '\n' else ' ' for c in m[0]), source)
    return set(re.findall(r'\b([^\W\d]\w*)\s*(?:\[[^\]]*\]\s*)?:', masked))


def _literals(grammar):
    model = metamodel_for_language('textx').grammar_model_from_str(grammar)
    values = set()
    for match in get_children_of_type('StrMatch', model):
        parent = match
        while parent is not None and type(parent).__name__ != 'TextxRule':
            parent = getattr(parent, 'parent', None)
        if parent is not None and parent.name != 'Comment' and match.match:
            values.add(match.match)
    return values


class CompletionEngine:
    def __init__(self):
        self.grammar_parser = metamodel_for_language('textx')
        grammar_source = Path(self.grammar_parser.metamodel.file_name).read_text()
        self.grammar_vocabulary = _literals(grammar_source) | set(BASE_TYPE_NAMES)

    @staticmethod
    @lru_cache(maxsize=8)
    def model_language(grammar):
        if not grammar.strip():
            return None
        try:
            return metamodel_from_str(grammar), _literals(grammar)
        except (TextXError, OSError, AssertionError):
            # Imports without a file context raise AssertionError in textX.
            return None

    def complete(self, language_id, source, grammar, line, character):
        cursor = utf16_offset(source, line, character)
        start = end = cursor
        while start > 0 and _word_char(source[start - 1]):
            start -= 1
        while end < len(source) and _word_char(source[end]):
            end += 1
        prefix = source[start:cursor]
        names = set()
        if language_id == 'textx':
            parse = self.grammar_parser.grammar_model_from_str
            names = _rule_names(source)
            vocabulary = self.grammar_vocabulary | names
        elif language_id == 'demo':
            language = self.model_language(grammar)
            if language is None:
                return []
            metamodel, vocabulary = language
            parse = metamodel.model_from_str
        else:
            return []

        probe = source[:start]
        expected = []
        try:
            parse(probe)
            parse(probe + '\0')
        except TextXSyntaxError as error:
            # textX error columns count Python characters, not UTF-16 units.
            target = (probe.count('\n') + 1, len(probe.rsplit('\n', 1)[-1]) + 1)
            if (error.line, error.col) == target:
                expected = error.expected_rules or []
        except TextXError:
            pass

        candidates = {
            rule.to_match for rule in expected
            if isinstance(rule, StrMatch) and rule.to_match in vocabulary
        }
        if any(getattr(rule, 'rule_name', '') == 'ID' for rule in expected):
            candidates.update(names)
        fallback = not candidates
        if fallback:
            candidates = vocabulary

        results = []
        for label in sorted(candidates):
            if not label.startswith(prefix):
                continue
            word = bool(label) and _word_char(label[0])
            results.append({
                'label': label,
                'rule_name': label in names,
                'fallback': fallback,
                'start': utf16_position(source, start if word else cursor),
                'end': utf16_position(source, end if word else cursor),
            })
        return results
