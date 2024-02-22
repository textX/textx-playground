// @ts-ignore
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

const LOG_PREFIX = `[${self.name}]`;
const log = (message: string) => console.log(LOG_PREFIX, message);

let pyodideReady: any;

type ScriptName = 'textxInstallation' | 'textxServer' | 'languageClientMessageHandler' | 'grammarParser' | 'parseGrammarHandler' | 'textxGrammar';

const scripts = {
  textxInstallation: '',
  textxServer: '',
  languageClientMessageHandler: '',
  grammarParser: '',
  parseGrammarHandler: '',
  textxGrammar: ''
};

onmessage = async (event) => {

  if (event.data.type === 'start-textx-worker') {
    log(event.data)

    for (let key of Object.keys(scripts)) {
      scripts[key as ScriptName] = await getScriptContent(event.data.scriptUrls[key]);
    }

    self.GRAMMAR_DOC_URI = event.data.grammarUri;
    self.MODEL_DOC_URI = event.data.modelUri;

    pyodideReady = await initPyodideTextxServerAndGrammarParser();
    postMessage({ type: "textx-worker-started" });
    return;
  }

  log(event.data)

  let pyodide = await pyodideReady;

  if (event.data.type === 'parse-grammar') {
    const { grammar, languageId } = event.data;

    // language_for_grammar_parsing and grammar_for_parsing variable names must match the ones imported in parseGrammarHandler.py
    self.language_for_grammar_parsing = languageId;
    self.grammar_for_parsing = languageId === 'textx' ? scripts.textxGrammar : grammar;

    const grammarInfo = await pyodide.runPython(scripts.parseGrammarHandler);
    
    postMessage({ 
      type: "grammar-parsed",
      languageId,
      grammarInfo
    });
    return;
  }

  // language_client_message variable name must match the one imported in languageClientMessageHandler.py
  self.language_client_message = JSON.stringify(event.data);

  await pyodide.runPython(scripts.languageClientMessageHandler);
}

async function initPyodideTextxServerAndGrammarParser() {

  log("Initializing pyodide...");

  // @ts-ignore
  let pyodide = await loadPyodide()

  log("Installing dependencies...");

  await pyodide.loadPackage(["micropip"])
  await pyodide.runPythonAsync(scripts.textxInstallation);
  await pyodide.runPythonAsync(scripts.grammarParser);

  pyodide.globals.get('sys').stdout.write = patchedStdout;

  log("Starting TextX server...");

  await pyodide.runPythonAsync(scripts.textxServer);

  log("TextX server started...");

  return pyodide;
}

async function getScriptContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file ${url}`);
    }
    return await response.text();
  } catch (e) {
    console.log(e);
    throw e;
  }
}

function patchedStdout(data: any) {
  if (!data.trim()) {
    return
  }

  const message = JSON.parse(data);

  log(message)
  postMessage(message)
}
