import { MonacoLanguageClient, initServices } from "monaco-languageclient";
import { CloseAction, ErrorAction, MessageTransports } from "vscode-languageclient";
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import TextXWorker from '../textXWorker?worker';

export const setupTextXLanguageClient = async (): Promise<Worker> => {

    await initServices({});

    const worker = new TextXWorker({
      name: 'TextX Worker'
    });
    const reader = new BrowserMessageReader(worker);
    const writer = new BrowserMessageWriter(worker);
    const languageClient = createLanguageClient({
      reader,
      writer
    });
    languageClient.start();
    reader.onClose(() => languageClient.stop());
    
    return worker;
  };


export const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
    return new MonacoLanguageClient({
      name: 'TextX Language Client',
      clientOptions: {
        documentSelector: ['textx', 'demo'],
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