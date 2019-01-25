/**
 * Created by WittBulter on 2017/2/16.
 */
const { app, BrowserWindow } = require('electron')

module.exports = new class self {
  constructor() {
  }
  
  open(url) {
    const win = new BrowserWindow({
      width: 1000,
      height: 720,
      show: true,
      frame: true,
      resizable: true,
    })
    win.loadURL(`${url}`)
    win.webContents.openDevTools()
    return win
  }
}()

