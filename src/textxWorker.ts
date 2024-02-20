// @ts-ignore
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

const LOG_PREFIX = `[${self.name}]`;
const log = (message: string) => console.log(LOG_PREFIX, message);

let pyodideReady: any;

type ScriptName = 'textxInstallation' | 'textxServer' | 'clientMessageHandler';

const scripts = {
  textxInstallation: '',
  textxServer: '',
  clientMessageHandler: '',
};

onmessage = async (event) => {

  if (event.data.type === 'start-textx-worker') {
    log(event.data)

    for (let key of Object.keys(scripts)) {
      scripts[key as ScriptName] = await getFileContent(event.data.scriptUrls[key]);
    }
    pyodideReady = await initPyodide();
    postMessage("textx-worker-started");
    return;
  }

  log(event.data)

  let pyodide = await pyodideReady;

  // variable name (client_message) must mach the one from the processClientMessage.py import
  /* @ts-ignore */
  self.client_message = JSON.stringify(event.data);

  await pyodide.runPython(scripts.clientMessageHandler);
}

async function initPyodide() {

  log("Initializing pyodide...");

  // @ts-ignore
  let pyodide = await loadPyodide()

  log("Installing dependencies...");

  await pyodide.loadPackage(["micropip"])
  await pyodide.runPythonAsync(scripts.textxInstallation);

  pyodide.globals.get('sys').stdout.write = patchedStdout;

  log("Starting TextX server...");

  await pyodide.runPythonAsync(scripts.textxServer);

  log("TextX server started...");

  return pyodide;
}

async function getFileContent(url: string): Promise<string> {
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
