const fs = require('fs-extra');

module.exports = {
    getPromptScriptFile: function (req, res) {
        const url = req.url.substr(15);
        const path = url.replace('prompt/', '');
        const rootPath = req.settings.config['rootPath'].replaceAll('\\', '/');
		res({ path: `${rootPath}/${path}` })
    }
  };
  