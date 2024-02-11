export const createDefaultGrammarContent = (): string => {
    return `Scene:
    /* The root rule */
    shapes*=Shape //First, define some shapes
    draw_instructions*=DrawInstruction //Then, tell the turtle to draw them
;

Shape:
    'shape' name=ID
        line_color=LineColor?
        fill_color=FillColor?
        lines+=Line
    'end'
;

Color:
    'red' | 'green' | 'blue' | 'yellow' | 'magenta' | 'cyan' | 'black' | 'white' | /#[0-9a-f]{6}/
;

LineColor:
    'lines' color=Color
;

FillColor:
    'fill' color=Color
;

Line:
    'line' direction=Direction length=INT
;

Direction:
    bearing=Bearing | angle=Angle
;

Bearing:
    'E' | 'NE' | 'SE' | 'W' | 'NW' | 'SW' | 'N' | 'S'
;

Angle:
    degrees=FLOAT ('°' | 'deg')
;

DrawInstruction:
    'draw' shape=[Shape] position=Position?
;

Position:
    'at' x=INT ',' y=INT
;

Comment:
    /\\/\\*(.|\\n)*?\\*\\// | /\\/\\/.*?$/
;`;
};

export const createDefaultModelContent = (): string => {
    return `shape black_and_white
    line E 150
    line NW 71
    line W 50
    line SW 71
end

shape triangle
    liness
`;
};
