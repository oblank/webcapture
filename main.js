// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, Tray, Menu} = require('electron')
const path = require('path')
const fs = require('fs');
const captureWebsite = require('capture-website');
const log = require("electron-log");
log.transports.console.level = 'silly';
log.transports.console.level = false;

const appPath = app.getPath('desktop');
const execPath = path.dirname(app.getPath('exe'));
console.log(appPath)

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 700,
        height: 550,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            enableRemoteModule: true
        },
    })
    global.mainId = mainWindow.id;

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // 禁止关闭应用
    mainWindow.on('close', function (event) {
        mainWindow.hide();
        mainWindow.setSkipTaskbar(true);
        event.preventDefault();

        // app.quit()
    })

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    createTray();

    // 10s 抓取一次
    captureSites()
    setInterval(() => {
        captureSites()
    }, 10000)
})

let tray = null
function createTray() {
    const mainWindow = BrowserWindow.fromId(global.mainId);
    tray = new Tray(path.join(__dirname, "./electron.ico"));
    const contextMenu = Menu.buildFromTemplate([{
        label: '退出', click: function () {
            mainWindow.destroy();
            app.quit();
        }
    },])
    tray.setToolTip('报价大屏网页抓取工具')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
            mainWindow.setSkipTaskbar(false);
        } else {
            mainWindow.show();
            mainWindow.setSkipTaskbar(true);
        }
    })
}

const stockUrl = 'https://lite.jjh9999.com/c/2281362146558722?type=stock'
const priceUrl = 'https://lite.jjh9999.com/c/2281362146558722?type=price'
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
async function captureSites() {
    console.log("screen captureing!");
    let executablePath = chromePath
    if (fs.existsSync(chromePath)) {
        executablePath = chromePath
    }
    else if (fs.existsSync(edge)) {
        executablePath = edge
    }
    const optionsA = {
        width: 1568,
        height: 674,
        timeout: 15,
        waitForElement: ".quote-td--item",
        overwrite: true,
        launchOptions: {
            executablePath: executablePath,
        }
    };
    const optionsB = {
        width: 1152,
        height: 784,
        timeout: 15,
        waitForElement: ".quote-td--item",
        overwrite: true,
        launchOptions: {
            executablePath: executablePath,
        }
    };
    const datetime = new Date().toISOString();
    const suffixA = `${optionsA.width}x${optionsA.height}`;
    const suffixB = `${optionsB.width}x${optionsB.height}`;

    global.sharedObject = {
        appPath: appPath,
        execPath: execPath,
        executablePath: executablePath,
        stockUrl: `${execPath}${path.sep}stock_${suffixA}.png`,
        priceUrl: `${execPath}${path.sep}price_${suffixA}.png`,
        datetime: new Date().toISOString()
    };
    log.warn(appPath, execPath)
    try {
        await captureWebsite.file(stockUrl, `${execPath}${path.sep}stock_${suffixA}.png`, optionsA);
        await captureWebsite.file(stockUrl, `${execPath}${path.sep}stock_${suffixB}.png`, optionsB);
        await captureWebsite.file(priceUrl, `${execPath}${path.sep}price_${suffixA}.png`, optionsA);
        await captureWebsite.file(priceUrl, `${execPath}${path.sep}price_${suffixB}.png`, optionsB);
    } catch (e) {
        console.error(e)
        log.error(e)
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    // if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
