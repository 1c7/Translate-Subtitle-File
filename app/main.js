const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
require('electron-reload')(__dirname, {
  electron: require('${__dirname}/../../node_modules/electron')
})

let win

function createWindow() {
  win = new BrowserWindow({
    width: 695,
    height: 368,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    title: '字幕组机翻小助手',
    resizable: false,
    kiosk: true,
    fullscreen: false,
    fullscreenable: false,
  })
  // https://github.com/electron/electron/blob/master/docs/api/browser-window.md

  win.setMenu(null); // only work on Linux & Windows
  // 移除菜单栏

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // 开发者工具
  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})
