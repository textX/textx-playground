import { editor, languages, Uri } from "monaco-editor";
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { MonacoLanguageClient, initServices } from "monaco-languageclient";
import { CloseAction, ErrorAction, MessageTransports } from "vscode-languageclient";
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import { createConfiguredEditor } from 'vscode/monaco';

export const GRAMMAR_FILE_URI = 'inmemory://model/1';
export const MODEL_FILE_URI = 'inmemory://model/2';

self.MonacoEnvironment = {
  getWorker: function () {
    return new editorWorker();
  }
};

export const initEditorServices = async () => {
  return initServices({
    userServices: {
      enableFilesService: true,
      enableModelService: true,
      enableLanguagesService: true,
    },
  });
}

export const setupTextXLanguageClient = async (): Promise<{ worker: Worker, startedCallback: () => void }> => {
  const worker = new Worker(new URL('../textxWorker.ts', import.meta.url), {
    name: 'TextX Worker',
  })
  worker.postMessage({
    type: 'start-textx-worker',
    scriptUrls: {
      textxInstallation: (new URL('../scripts/textxInstallation.py', import.meta.url)).toString(),
      textxServer: (new URL('../scripts/textxServer.py', import.meta.url)).toString(),
      completion: (new URL('../scripts/completion.py', import.meta.url)).toString(),
      languageClientMessageHandler: (new URL('../scripts/languageClientMessageHandler.py', import.meta.url)).toString(),
      grammarParser: (new URL('../scripts/grammarParser.py', import.meta.url)).toString(),
      parseGrammarHandler: (new URL('../scripts/parseGrammarHandler.py', import.meta.url)).toString(),
      textxGrammar: (new URL('../scripts/textx.tx', import.meta.url)).toString(),
      visualizeGrammarHandler: (new URL('../scripts/visualizeGrammarHandler.py', import.meta.url)).toString(),
      visualizeModelHandler: (new URL('../scripts/visualizeModelHandler.py', import.meta.url)).toString(),
    },
    grammarUri: GRAMMAR_FILE_URI,
    modelUri: MODEL_FILE_URI,
  });
  return {
    worker,
    startedCallback: () => {
      const reader = new BrowserMessageReader(worker);
      const writer = new BrowserMessageWriter(worker);
      const languageClient = createLanguageClient({
        reader,
        writer
      });
      languageClient.start();
      reader.onClose(() => languageClient.stop());
    }
  };
};

export const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: 'TextX Language Client',
    clientOptions: {
      documentSelector: [{ language: 'textx' }, { language: 'demo' }],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart })
      }
    },
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      }
    }
  });
};

export const createEditor = (config: {
  languageId: string,
  languageExtension: string,
  fileName: string;
  htmlElement: HTMLElement,
  content: string,
}) => {
  const { languageId, languageExtension, fileName } = config;
  console.log(`Create ${fileName} editor`)

  languages.register({
    id: languageId,
    extensions: [`.${languageExtension}`],
  });

  const monacoEditor = createConfiguredEditor(config.htmlElement, {
    model: editor.createModel(config.content, languageId,
      Uri.parse(languageId === 'textx' ? GRAMMAR_FILE_URI : MODEL_FILE_URI)),
    quickSuggestions: { other: true, comments: false, strings: false },
    suggestOnTriggerCharacters: true,
    glyphMargin: true,
    lightbulb: {
      enabled: true
    },
    automaticLayout: true,
  });

  // Vite deduplicates Monaco at runtime; vscode ships a second copy of its types.
  return monacoEditor as unknown as editor.IStandaloneCodeEditor;
};

export const setSyntaxHighlighting = (languageId: string, grammarInfo: any) => {
  if (languageId === 'textx') {
    languages.setMonarchTokensProvider(languageId, {
      keywords: grammarInfo.keywords.filter((k: string) => !k.startsWith('\\\\')),

      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

      tokenizer: {
        root: [
          [/[A-Za-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],

          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/'/, 'string', '@string'],

          { include: '@comment' },
          { include: '@whitespace' },
        ],

        string: [
          [/[^\\']+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/'/, 'string', '@pop']
        ],

        comment: grammarInfo.comments.map((c: string) => ([new RegExp(c), 'comment'])),

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
        ],
      },
    });
  } else {
    languages.setMonarchTokensProvider(languageId, {
      keywords: grammarInfo.keywords.filter((k: string) => !k.startsWith('\\\\')),

      tokenizer: {
        root: [
          [/[A-Za-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],

          { include: '@comment' },
          { include: '@whitespace' },
        ],

        comment: grammarInfo.comments.map((c: string) => ([new RegExp(c), 'comment'])),

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
        ],
      },
    });
  }
}
