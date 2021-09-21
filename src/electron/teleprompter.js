module.exports = {
    setPromptingScript: function (req, res) {
    //   console.log(req.mainWindow.teleprompter.settings);
      
    },
    getPromptingScript: function (req, res) {
        // console.log(req.mainWindow.teleprompter.settings);
        console.log("request", req.settings)

        req.settings['ElectronTesting'] = "Coolest";

    }
  };
  