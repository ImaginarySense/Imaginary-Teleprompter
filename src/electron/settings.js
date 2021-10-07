const fs = require('fs-extra');
const path = require('path');
const _package = require('./package.json');

class Settings {
    constructor(app) {
        this.setElectronApp(app);
    }

    setElectronApp(app) {
        this.app = app;
        this.userData = this.app.getPath('userData');
        this.documentsPath = this.app.getPath('documents');
        this.configFileName = "config.json";
        this.settingsFileName = "settings.json";
        this.rootName = "Imaginary Teleprompter";
        this.setupConfig();
    }

    async setupConfig() {
        this.configFile = path.join(this.userData, this.rootName, this.configFileName);

        try {
            await fs.ensureFile(this.configFile);
        } catch (err) {
            console.error(err);
        }

        try {
            this.config = await fs.readJson(this.configFile);
            this.settingsFile = path.join(this.config["rootPath"], this.settingsFileName);
            this.data = await fs.readJson(this.settingsFile);
            // Update version number
            this.data["currentVersion"] = `${_package.version}.${_package.revision}`;
            this.saveSettings();
        } catch (err) {
            this.config = {
                "rootPath": path.join(this.documentsPath, this.rootName)
            }
            this.settingsFile = path.join(this.config["rootPath"], this.settingsFileName);
            
            try {
                await fs.ensureFile(this.settingsFile);
            } catch (err) {
                console.error(err);
            }

            // defaults
            this.data = {
                "currentVersion": `${_package.version}.${_package.revision}`
            } 
            // save settings and config
            this.saveSettings();
            this.saveConfig();
        }
    }

    saveSettings() {
        this.saveData(this.settingsFile, this.data, (data, _) => {
            if (typeof data !== 'undefined') {
                this.data = data;
            }
        });
    }

    saveConfig() {
        this.saveData(this.configFile, this.config, (data, _) => {
            if (typeof data !== 'undefined') {
                this.config = data;
            }
        });
    }

    async saveData(file, data, callback) {
        try {
            await fs.outputJson(file, data, {spaces: 2});
            // Making sure
            callback(await fs.readJson(file), undefined);
        } catch (err) {
            callback(undefined, err);
        }
    }

    getItem(key, defaults = undefined) {
        return this.data[key] || defaults;
    }

    setItem(key, value, defaults = undefined) {
        this.data[key] = value || defaults;
        this.saveSettings();
    }

    getConfigItem(key, defaults = undefined) {
        return this.config[key] || defaults;
    }
};

module.exports = Settings;