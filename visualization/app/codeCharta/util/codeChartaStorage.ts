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
		this.storageEngine.setItem(key, value)
	}
}

export class CodeChartaFileStorageEngine implements Storage {
	private fileStoragePath = `${fs.realpathSync(".")}/app/codeCharta/ressources/fileStorage/`

	// TODO: Find out, how to implement this.
	readonly length = -1

	clear(): void {
		fs.readdirSync(this.fileStoragePath).forEach(file => {
			fs.unlinkSync(this.fileStoragePath + file)
		})
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
