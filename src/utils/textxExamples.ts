import drawingGrammar from './textx-examples/drawing/drawing.tx?raw';
import drawingModel from './textx-examples/drawing/example.dr?raw';
import turtleGrammar from './textx-examples/turtle/turtle.tx?raw';
import turtleModel from './textx-examples/turtle/example.turtle?raw';
import expressionGrammar from './textx-examples/expression/expression.tx?raw';
import expressionModel from './textx-examples/expression/example.exp?raw';
import entityModel from './textx-examples/entity/example.entity?raw';

export type TextxExample = {
    name: string;
    grammar: string;
    model: string;
}

const TEXTX_GITHUB_EXAMPLES_URL = 'https://raw.githubusercontent.com/textX/textX/master/examples';

const toExampleUrl = (path: string) => `${TEXTX_GITHUB_EXAMPLES_URL}${path}`;

const textxExamples: TextxExample[] = [
    {
        name: 'Hello World',
        grammar: toExampleUrl('/hello_world/hello.tx'),
        model: toExampleUrl('/hello_world/example.hello')
    },
    {
        name: 'Entity',
        grammar: toExampleUrl('/Entity/entity.tx'),
        model: entityModel
    },
    {
        name: 'State Machine',
        grammar: toExampleUrl('/StateMachine/state_machine.tx'),
        model: toExampleUrl('/StateMachine/gate.sm')
    },
    {
        name: 'Drawing',
        grammar: drawingGrammar,
        model: drawingModel
    },
    {
        name: 'Turtle',
        grammar: turtleGrammar,
        model: turtleModel
    },
    {
        name: 'Robot',
        grammar: toExampleUrl('/robot/robot.tx'),
        model: toExampleUrl('/robot/program.rbt')
    },
    {
        name: 'Workflow',
        grammar: toExampleUrl('/workflow/workflow.tx'),
        model: toExampleUrl('/workflow/example.wf')
    },
    {
        name: 'Expression',
        grammar: expressionGrammar,
        model: expressionModel
    },
    {
        name: 'JSON',
        grammar: toExampleUrl('/json/json.tx'),
        model: toExampleUrl('/json/example1.json')
    },
    {
        name: 'pyFlies',
        grammar: toExampleUrl('/pyFlies/pyflies.tx'),
        model: toExampleUrl('/pyFlies/experiment.pf')
    },
    {
        name: 'IBM Rhapsody',
        grammar: toExampleUrl('/IBM_Rhapsody/rhapsody.tx'),
        model: toExampleUrl('/IBM_Rhapsody/LightSwitch.rpy')
    },
]

export const getTextxExampleCode = async (example: TextxExample) => {
    const grammar = example.grammar.startsWith('https://') ?
        await fetch(example.grammar).then((res) => res.text()) :
        example.grammar;
    const model = example.model.startsWith('https://') ?
        await fetch(example.model).then((res) => res.text()) :
        example.model;
    return {
        grammar,
        model
    };
}

export default textxExamples;