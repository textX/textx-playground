from textx import metamodel_from_str
from textx.export import model_export

from js import model_for_visualization, grammar_for_visualization

EXPORTED_FILE_NAME = 'model.dot'


entity_mm = metamodel_from_str(grammar_for_visualization)

model = entity_mm.model_from_str(model_for_visualization)

model_export(model, EXPORTED_FILE_NAME)

exported_file = open(EXPORTED_FILE_NAME, 'r')
exported_file.read()