import angular from "angular"
import * as d3 from "d3"
import { CCFile, CodeMapNode } from "../codeCharta.model"

export class FileDownloader {
	private static CC_FILE_EXTENSION = ".cc.json"

	public static downloadCurrentMap(file: CCFile) {
		const data = this.getProjectDataAsCCJsonFormat(file)
		this.downloadData(data, this.getNewFileName(file))
	}

	private static getProjectDataAsCCJsonFormat(file: CCFile) {
		let newFileName = this.getNewFileName(file)

		return {
			fileName: newFileName,
			projectName: file.fileMeta.projectName,
			apiVersion: file.fileMeta.apiVersion,
			nodes: [this.removeJsonHashkeysAndVisibleAttribute(file.map)],
			edges: file.settings.fileSettings.edges,
			attributeTypes: file.settings.fileSettings.attributeTypes,
			blacklist: file.settings.fileSettings.blacklist
		}
	}

	private static removeJsonHashkeysAndVisibleAttribute(map: CodeMapNode) {
		let copy: CodeMapNode = JSON.parse(JSON.stringify(map))
		d3.hierarchy(copy).each(node => {
			delete node.data.visible
		})
		return copy
	}

	private static getNewFileName(file: CCFile): string {
		return this.getFileNameWithoutTimestamp(file.fileMeta.fileName) + this.getNewTimestamp() + FileDownloader.CC_FILE_EXTENSION
	}

	private static getNewTimestamp(): string {
		const date: Date = new Date()
		return (
			"_" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "_" + date.getHours() + "-" + date.getMinutes()
		)
	}

	private static getFileNameWithoutTimestamp(fileName: string): string {
		const dateRegex: RegExp = /\_\d{4}\-\d{1,2}\-\d{1,2}\_\d{1,2}\-\d{1,2}\./

		if (dateRegex.test(fileName)) {
			return fileName.substring(0, dateRegex.exec(fileName).index)
		} else if (fileName.includes(FileDownloader.CC_FILE_EXTENSION)) {
			return fileName.substring(0, fileName.search(FileDownloader.CC_FILE_EXTENSION))
		} else if (fileName.includes(".json")) {
			return fileName.substring(0, fileName.search(".json"))
		} else {
			return fileName
		}
	}

	private static downloadData(data, fileName) {
		let dataJson = data
		if (typeof data === "object") {
			dataJson = angular.toJson(data, 4)
		}

		const blob = new Blob([dataJson], { type: "text/json" })
		const e = document.createEvent("MouseEvents")
		const a = document.createElement("a")

		a.download = fileName
		a.href = window.URL.createObjectURL(blob)
		a.dataset.downloadurl = ["text/json", a.download, a.href].join(":")
		e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
		a.dispatchEvent(e)
	}
}
