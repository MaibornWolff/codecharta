"use strict"

import fs from "fs"
import { isStandalone } from "./envDetector"

export class CodeChartaStorage implements Storage {
	private storageEngine: Storage = isStandalone() ? new CodeChartaFileStorageEngine() : localStorage
	readonly length = -1

	clear(): void {
		this.storageEngine.clear()
	}

	getItem(key: string): string | null {
		return this.storageEngine.getItem(key)
	}

	key(index: number): string | null {
		return this.storageEngine.key(index)
	}

	removeItem(key: string): void {
		this.storageEngine.removeItem(key)
	}

	setItem(key: string, value: string): void {
		try {
			this.storageEngine.setItem(key, value)
		} catch (error) {
			alert("Browser local storage memory limit exceeded. Some functions of the application may not longer work.")
			alert(error)
		}
	}
}

export class CodeChartaFileStorageEngine implements Storage {
	private fileStoragePath = `${fs.realpathSync(".")}/app/codeCharta/resources/fileStorage/`

	// TODO: Find out, how to implement this.
	readonly length = -1

	clear(): void {
		for (const file of fs.readdirSync(this.fileStoragePath)) {
			fs.unlinkSync(this.fileStoragePath + file)
		}
	}

	getItem(key: string): string | null {
		return fs.readFileSync(this.fileStoragePath + key).toString()
	}

	key(index: number): string | null {
		return fs.readdirSync(this.fileStoragePath)[index] ?? null
	}

	removeItem(key: string): void {
		fs.unlinkSync(this.fileStoragePath + key)
	}

	setItem(key: string, value: string): void {
		fs.writeFileSync(this.fileStoragePath + key, value, { encoding: "utf-8" })
	}
}
