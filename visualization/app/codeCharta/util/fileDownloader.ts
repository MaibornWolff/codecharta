import angular from "angular"
import * as d3 from "d3"
import { CCFile, CodeMapNode } from "../codeCharta.model"
import { Tokens } from "marked"

export class FileDownloader {
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
		let copy = JSON.parse(JSON.stringify(map))
		d3.hierarchy(copy).each(node => {
			delete node.data.visible
		})
		return copy
	}

	private static getNewFileName(file: CCFile) {
		return this.addDateToFileName(file.fileMeta.fileName) + ".cc.json"
	}

	private static addDateToFileName(fileName: string) {
		const dateRegex = /\_\d{4}\-\d{1,2}\-\d{1,2}\_\d{1,2}\-\d{1,2}\./
		const date = new Date()
		const dateString =
			"_" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "_" + date.getHours() + "-" + date.getMinutes()

		if (dateRegex.test(fileName)) {
			return fileName.substring(0, dateRegex.exec(fileName).index) + dateString
		} else {
			return this.addTimestamp(fileName, dateString)
		}
	}

	private static addTimestamp(fileName: string, dateString: string) {
		if (fileName.includes(".cc.json")) {
			return fileName.substring(0, fileName.search(".cc.json")) + dateString
		} else if (fileName.includes(".json")) {
			return fileName.substring(0, fileName.search(".json")) + dateString
		} else {
			return fileName + dateString
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
