/**
 * Created by WittBulter on 2017/2/16.
 */
const { app, BrowserWindow } = require('electron')

module.exports = new class Login {
  constructor() {
  }
  
  open(url) {
    const win = new BrowserWindow({
      width: 1024,
      height: 768,
      show: true,
      frame: true,
      resizable: true,
    })
    win.loadURL(url)
    // win.webContents.openDevTools()
    return win
  }
}()