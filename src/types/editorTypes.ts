export enum EditorStatusType {
    LOADING = 'loading',
    ERROR = 'error',
    SUCCESS = 'success',
    INFO = 'info',
}

export type EditorStatus = {
    type?: EditorStatusType;
    position?: [number, number];
    message: string;
}

export type GrammarInfo = {
    name: string;
    keywords: string[];
    comments: string[];
    regexes: string[];
}