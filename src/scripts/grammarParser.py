from textx import metamodel_for_language, get_children_of_type
import string


def parse_grammar(grammar_str, lang_name, skip_keywords=False):
    """
    Collects information about grammar using textX object processors.
    Currently collects only `StrMatch` and `ReMatch` rules, since those are
    language keywords and identifiers.
    """
    textx_mm = metamodel_for_language("textx")
    grammar_model = textx_mm.grammar_model_from_str(grammar_str)
    grammar_info = GrammarInfo(lang_name)

    if skip_keywords is False:
        for str_match in get_children_of_type("StrMatch", grammar_model):
            keyword = _escape_keyword(str_match.match)
            if keyword not in grammar_info.keywords:
                grammar_info.keywords.append(keyword)

    for reg_match in get_children_of_type("ReMatch", grammar_model):
        if _get_textx_rule_name(reg_match.parent) == "Comment":
            grammar_info.comments.append(reg_match.match)
        else:
            grammar_info.regexes.append(reg_match.match)

    return grammar_info


def _escape_keyword(keyword):
    """
    Prepend `\\\\` to all chars that can't be part of keyword identifier.
    NOTE: `re.escape` does not work the same for 3.6 and 3.7 versions.
    """
    IDENT_LETTERS = string.ascii_letters + string.digits + "_"

    return "".join(
        [
            letter if letter in IDENT_LETTERS else "\\\\{}".format(letter)
            for letter in keyword
        ]
    )


def _get_textx_rule_name(parent_rule):
    """
    Iterate parent instances until `TextxRule` instance.
    """
    while not type(parent_rule).__name__ == "TextxRule":
        parent_rule = parent_rule.parent
    return parent_rule.name


class GrammarInfo:
    """
    Holds grammar information needed to generate syntax highlighting file(s).
    """

    def __init__(self, name):
        self.name = name
        self.keywords = []
        self.regexes = []
        self.comments = []

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, 
            sort_keys=True, indent=4)

