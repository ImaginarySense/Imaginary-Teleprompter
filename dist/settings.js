const fs = require('fs-extra');
const path = require('path');

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
            this.settingsFile = this.config["settingPath"];
            this.data = await fs.readJson(this.settingsFile);
        } catch (err) {
            this.settingsFile = path.join(this.documentsPath, this.rootName, this.settingsFileName);
            
            try {
                await fs.ensureFile(this.settingsFile);
            } catch (err) {
                console.error(err);
            }
            this.data = {
                "currentVersion": "4.0"
            } // defaults
            this.saveSettings();

            this.config = {
                "settingPath": this.settingsFile
            }
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
            await fs.outputJson(file, data);
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
};

module.exports = Settings;