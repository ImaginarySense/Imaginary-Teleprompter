window.teleprompter = {
    editor: {},
    themes: {},
    commandsMapping: {},
    controls: {},
    fileManager: {},
    prompter: {}
};

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var body = document.body;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    body.appendChild(script);
}

function loadCSS(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.head;
    var script = document.createElement('link');
    script.rel = 'stylesheet';
    script.href = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

function hexc(orig) {
    var rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+)/i);
    return (rgb && rgb.length === 4) ?
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : orig;
}

function inElectron() {
    return navigator.userAgent.indexOf("Electron") !== -1;
}