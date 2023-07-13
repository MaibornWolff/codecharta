// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, shell } = require("electron")
const path = require("path")

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 1400,
		height: 900
	})

	// open links in web browser instead of in electron
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url)
		return { action: "deny" }
	})

	// and load the index.html of the app
	mainWindow.loadFile(path.join(__dirname, "index.html"))

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}

app.enableSandbox()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
	}
})
