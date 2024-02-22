import os
from js import grammar_for_parsing, language_for_grammar_parsing


def parse_language_grammar():
    grammar_info = parse_grammar(grammar_for_parsing, language_for_grammar_parsing)
    return grammar_info.toJSON()


parse_language_grammar()