from textx import metamodel_from_str
from textx.export import metamodel_export

from js import grammar_for_visualization

EXPORTED_FILE_NAME = 'grammar.dot'


entity_mm = metamodel_from_str(grammar_for_visualization)

metamodel_export(entity_mm, EXPORTED_FILE_NAME)

exported_file = open(EXPORTED_FILE_NAME, 'r')
exported_file.read()