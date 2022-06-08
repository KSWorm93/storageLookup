const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.send('info');

ipcRenderer.on('info:reply', function (event, info) {
    let divMsg
        = 'The database containing all your information are saved in '
        + '<strong>' + info.location + '</strong>'
        + ', in a file called ' + '<strong>' + info.dbFile + '</strong>';
    let div = 'databaseDiv';
    setDivMsg(div, divMsg)

    divMsg
        = 'This app is built using the Electron framework. '
        + 'Check out <a href="https://electronjs.org/">ElectronJS</a>';
    div = 'electronDiv';
    setDivMsg(div, divMsg)

    divMsg
        = 'To help navigate the app, use the menu in the top. '
        + 'Alternatively use keyboard shortcuts to navigate around'
        + '<div class="container">'
        + '<li>Quit App: ' + info.platformKey + 'Q</li>'
        + '<li>Go toAdd Item: ' + info.platformKey + 'Shift+A</li>'
        + '<li>Go to Home: ' + info.platformKey + 'H</li>'
        + '<li>Go to Info: ' + info.platformKey + 'I</li>'
        + '</div>';
    div = 'navigateDiv';
    setDivMsg(div, divMsg)
})

function setDivMsg(div, msg) {
    document.getElementById(div).innerHTML = msg;
}