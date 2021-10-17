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
    const rootPath = req.settings.config['rootPath'].replaceAll('\\', '/');
    let scriptFile;
    try {
      scriptFile = await fs.readJson(`${rootPath}/script.json`);
      // some validator of the data
    } catch (err) {
      res({
        statusCode: 404,
        data: createStream('')
      });
      return;
    }
    await createScriptStructure(rootPath);
    res(createStream(scriptFile));
  }
};
  