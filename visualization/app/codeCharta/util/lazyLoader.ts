import { isStandalone } from "./envDetector"

export class LazyLoader {
	private static _fileName: string
	private static _nodePath: string

	static async openFile(fileName: string = LazyLoader._fileName, nodePath: string = LazyLoader._nodePath) {
		if (!isStandalone()) {
			return
		}
		LazyLoader._fileName = fileName
		LazyLoader._nodePath = nodePath
		const directory = localStorage.getItem(LazyLoader._fileName)
		const path = nodePath.replace("root", directory)
		if (directory === null) {
			return LazyLoader.setDirectory()
		}
		//check if root still exists
		const exists = await LazyLoader.checkDirExists(directory)
		if (!exists) {
			alert(`Unknown or non-existent directory: ${directory}`)
			return LazyLoader.setDirectory()
		}
		const open = await import("open")
		try {
			await open.default(`file:///${path}`)
		} catch (error) {
			alert(error)
		}
	}

	private static async setDirectory() {
		let _default = "\\Users\\"
		if (navigator.userAgent.includes("Windows")) {
			_default = `C:${_default}`
		}
		let directoryName = prompt("Please enter a root directory path of the project", _default)
		if (directoryName) {
			directoryName = directoryName.replace(/\\/g, "/")
			localStorage.setItem(LazyLoader._fileName, directoryName)
			await LazyLoader.openFile()
		}
	}

	private static async checkDirExists(path: string) {
		const fs = await import("fs")
		return fs.existsSync(path)
	}
}
