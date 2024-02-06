import "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";

const LOG_PREFIX = `[${self.name}]`;
const log = (message: string) => console.log(LOG_PREFIX, message);

const pyodideReady = initPyodide()

onmessage = async (event) => {
  let pyodide = await pyodideReady

  log('Message from language client');
  log(event.data)

  // variable name (client_message) must mach the one from the processClientMessage.py import
  /* @ts-ignore */
  self.client_message = JSON.stringify(event.data);

  const processClientMessageScript = await getFileContent('./scripts/processClientMessage.py');
  await pyodide.runPythonAsync(processClientMessageScript);
}

async function initPyodide() {

  log("Initializing pyodide...");

  // @ts-ignore
  let pyodide = await loadPyodide()

  log("Installing dependencies...");

  const textxInstallationScript = await getFileContent('./scripts/textxInstallation.py');
  await pyodide.loadPackage(["micropip"])
  await pyodide.runPythonAsync(textxInstallationScript)

  pyodide.globals.get('sys').stdout.write = patchedStdout;

  log("Starting TextX server...");
  
  const textxServerScript = await getFileContent('./scripts/textxServer.py');
  await pyodide.runPythonAsync(textxServerScript);

  log("TextX server started...");

  postMessage("textx-worker-started");

  return pyodide
}

async function getFileContent(url: string) {
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

  log('Message from language server')
  log(message)
  postMessage(message)
}
