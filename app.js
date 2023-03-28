const electron = require('electron');
const url = require('url');
const path = require('path');
const datastore = require('nedb');
const platform = process.platform == 'darwin' ? 'Command+' : 'Ctrl+';
const keybinds = {
    quit: platform + 'Q',
    add: platform + 'Shift+A',
    home: platform + 'H',
    info: platform + 'I',
    devTool: platform + 'Shift+I'
}

const { app, BrowserWindow, Menu, ipcMain } = electron;

const dbFile = 'storageContent';
const dbPath = path.join(app.getPath('appData'), app.getName(), dbFile);
const database = new datastore({ filename: dbPath, autoload: true });

let mainWindow;

process.env.NODE_ENV = 'production';

//Electron callbacks
app.on('ready', function () {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegrationInWorker: true,
            nodeIntegration: true
        }
    });
    goToPage('index');

    const windowMenu = Menu.buildFromTemplate(windowMenuTemplate);
    Menu.setApplicationMenu(windowMenu);
})

//Renderer callbacks
ipcMain.on('items:add', function (event, item) {
    addItemsToDatabase(item);
});

ipcMain.on('pageload', function (event) {
    getItemsFromDatabase(loadItems, event);
});

ipcMain.on('items:delete', function (event, id) {
    deleteItemsFromDatabase(event, id);
});

ipcMain.on('info', function (event, param) {
    const info = {
        platform: process.platform,
        platformKey: platform,
        location: app.getPath('appData'),
        dbFile: dbFile
    };
    event.reply('info:reply', info);
})

//Window menu
const windowMenuTemplate = [
    createMenuTemplateObject('home', goToPage, { clickParam: 'index', accelerator: keybinds.home }),
    {
        label: 'Items',
        submenu: [
            createMenuTemplateObject('Add item', goToPage, { clickParam: 'addItem', accelerator: keybinds.add })
        ]
    },
    createMenuTemplateObject('Info', goToPage, { clickParam: 'info', accelerator: keybinds.info }),
    createMenuTemplateObject('Exit', app.quit, { accelerator: keybinds.quit }),
]

function createMenuTemplateObject(label, clickFunc, { accelerator = false, clickParam = false } = {}) {
    const entry = {
        label: label,
        click() {
            clickParam ? clickFunc(clickParam) : clickFunc()
        }
    }
    if (accelerator) { entry.accelerator = accelerator; };
    return entry;
}

//Utility
function goToPage(destination) {
    const filePath = path.join(__dirname, 'pages/' + destination + '.html');
    mainWindow.loadURL(url.format({
        pathname: filePath,
        protocol: 'file:',
        slashes: true
    }));
}

function loadItems(items, event = false) {
    event.reply('pageload:reply', items);
}

//CRUD functions
function getItemsFromDatabase(callback, extraParam = false, query = {}) {
    database.find(query, function (err, documents) {
        if (!err) {
            if (extraParam) {
                callback(documents, extraParam)
            } else {
                callback(documents);
            }
        }
    })
}

function addItemsToDatabase(item) {
    const itemDocument = {
        title: item.title,
        location: item.location
    };

    database.insert(itemDocument, function (err, newItem) {
        if (err) {
            console.log('Error inserting: ' + itemDocument.title);
        }
    });
}

function deleteItemsFromDatabase(event, id) {
    database.remove({ _id: id }, function (err) {
        if (!err) {
            event.reply('items:delete:reply', id);
        }
    });

}

//Dev environment tools
if (process.env.NODE_ENV !== 'production') { addDevEnvironment(); }
function addDevEnvironment() {
    windowMenuTemplate.push({ label: ' ' })
    windowMenuTemplate.push({
        label: 'Developers',
        submenu: [
            {
                label: 'Dev tools',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                },
                accelerator: keybinds.devTool
            },
            {
                role: 'reload'
            }
        ]
    })
}