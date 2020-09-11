// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, nativeImage } = require('electron')
const path = require('path')
const captureWebsite = require('capture-website');

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width         : 700,
        height        : 550,
        resizable     : false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // 禁止关闭应用
    mainWindow.on('close', function (event) {
        dialog.showMessageBox({
            type: "info",
            title: "提示",
            message: "关闭应用将导致报价图片得不到更新",
            buttons: ["取消"],
            cancelId: 1
        }, function (index) {
            event.preventDefault()
        });
        event.preventDefault()
    })

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // 10s 抓取一次
    captureSites()
    setInterval(() => {
        captureSites()
    }, 10000)
})

async function captureSites() {
    console.log("screen captureing!");
    const stockUrl = 'https://lite.jjh9999.com/c/2281362146558722?type=stock'
    const priceUrl = 'https://lite.jjh9999.com/c/2281362146558722?type=price'
    const optionsA = {
        width         : 1568,
        height        : 674,
        timeout       : 15,
        waitForElement: ".quote-td--item",
        overwrite     : true
    };
    const optionsB = {
        width         : 1152,
        height        : 784,
        timeout       : 15,
        waitForElement: ".quote-td--item",
        overwrite     : true
    };
    const datetime = new Date().toISOString();
    const suffixA = `${optionsA.width}x${optionsA.height}`;
    const suffixB = `${optionsB.width}x${optionsB.height}`;
    try {
        await captureWebsite.file(stockUrl, `stock_${suffixA}.png`, optionsA);
        await captureWebsite.file(stockUrl, `stock_${suffixB}.png`, optionsB);
        await captureWebsite.file(priceUrl, `price_${suffixA}.png`, optionsA);
        await captureWebsite.file(priceUrl, `price_${suffixB}.png`, optionsB);
    } catch (e) {
        console.error(e.message)
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
