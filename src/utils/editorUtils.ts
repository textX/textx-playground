import { languages } from "monaco-editor";
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
      clientMessageHandler: (new URL('../scripts/clientMessageHandler.py', import.meta.url)).toString()
    }
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

export const createEditor = async (config: {
  languageId: string,
  languageExtension: string,
  fileName: string;
  htmlElement: HTMLElement,
  content: string,
}) => {
  const { languageId, languageExtension, fileName } = config;
  console.log(fileName)

  languages.register({
    id: languageId,
    extensions: [`.${languageExtension}`],
  });

  const monacoEditor = createConfiguredEditor(config.htmlElement, {
    language: languageId,
    value: config.content,
    glyphMargin: true,
    lightbulb: {
      enabled: true
    },
    automaticLayout: true,
  });

  return monacoEditor;
};
