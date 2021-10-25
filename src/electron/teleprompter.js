const fs = require('fs-extra');
const { PassThrough } = require('stream')

function createStream (text) {
  const rv = new PassThrough() // PassThrough is also a Readable stream
  rv.push(text)
  rv.push(null)
  return rv
}

async function createScriptStructure(rootPath) {
  return new Promise(async (resolve, reject) => {
    // For future updates
    // try {
    //   let scriptSettingsFile = `${rootPath}/settings.json`;
    //   await fs.ensureFile(scriptSettingsFile)
    //   // Maybe in future add some initialization settings, for now empty
    //   await fs.outputJson(scriptSettingsFile, {})
    // } catch (err) {}
    try {
      await fs.ensureDir(`${rootPath}/images`)
    } catch (err) {}
    resolve();
  });
}

module.exports = {
  getPromptFileFromScript: (req, res) => {
    const url = req.url.substr(15);
    const path = url.replace('prompt/', '');
    const rootPath = req.settings.config['rootPath'].replaceAll('\\', '/');
    res(fs.createReadStream(`${rootPath}/${path}`));
  },
  getPromptScript: async (req, res) => {
    const scriptPath = req.body['path'].replaceAll('\\', '/');
    let scriptData;
    try {
      scriptData = await fs.readJson(`${scriptPath}/script.json`);
      // some validator of the data
    } catch (err) {
      res({
        statusCode: 404,
        data: createStream('')
      });
      return;
    }
    await createScriptStructure(scriptPath);
    res({
      statusCode: 200,
      data: createStream(JSON.stringify(scriptData))
    });
  },
  newPromptScript: async (req, res) => {
    const rootPath = req.settings.config['rootPath'].replaceAll('\\', '/');
    // Cleaning script file name to just permit alphabet
    let scriptFileName = req.body['name'].replace(/[^A-Za-z ]/gi,'');
    scriptFileName = scriptFileName.toLowerCase();
    scriptFileName = scriptFileName.match(/[a-z]+/gi).join('_');

    const scriptPath = `${rootPath}/${scriptFileName}`;

    let scriptData;
    try {
      let scriptFile = `${scriptPath}/script.json`;
      await fs.ensureFile(scriptFile)
      // Maybe in future add some initialization settings, for now empty
      await fs.outputJson(scriptFile, {
        version: 1.0,
        name: req.body['name'],
        data: ''
      })
      scriptData = await fs.readJson(scriptFile);
    } catch (err) {
      // Maybe an error if the script creation fails
    }
    await createScriptStructure(scriptPath);
    res({
      statusCode: 200,
      data: createStream(JSON.stringify({
        path: scriptPath,
        script: scriptData
      }))
    });
  },
  updatePromptScript: async (req, res) => {
    const scriptPath = req.body['path'].replaceAll('\\', '/');
    const scriptFile = `${scriptPath}/script.json`;
    let scriptData;
    try {
      scriptData = await fs.readJson(scriptFile);
      // some validator of the data
      scriptData['data'] = req.body['script'];
      await fs.outputJson(scriptFile, scriptData);
    } catch (err) {
      res({
        statusCode: 404,
        data: createStream('')
      });
      return;
    }
    res({
      statusCode: 200,
      data: createStream('{}')
    });
  }
};
  