import angular from "angular"
import * as d3 from "d3"
import { CCFile, CodeMapNode } from "../codeCharta.model"

export class FileDownloader {

	private static allSettingsNames: string[] = ["edges", "blacklist", "markedPackages"]

	public static downloadCurrentMap(file: CCFile, downloadSettingsNames: string[], fileName: string) {
		const data = this.getProjectDataAsCCJsonFormat(file, downloadSettingsNames)
		this.downloadData(data, fileName)
	}

	private static getProjectDataAsCCJsonFormat(file: CCFile, downloadSettingsNames: string[]) {
		let downloadObject: any = {
			projectName: file.fileMeta.projectName,
			apiVersion: file.fileMeta.apiVersion,
			nodes: [this.removeJsonHashkeysAndVisibleAttribute(file.map)],
			attributeTypes: file.settings.fileSettings.attributeTypes,
		}

		this.allSettingsNames.forEach(settingsName => {
			if(downloadSettingsNames.includes(settingsName)) {
				downloadObject[settingsName] = file.settings.fileSettings[settingsName]
			}
		})
		return downloadObject
	}

	private static removeJsonHashkeysAndVisibleAttribute(map: CodeMapNode) {
		let copy: CodeMapNode = JSON.parse(JSON.stringify(map))
		d3.hierarchy(copy).each(node => {
			delete node.data.visible
		})
		return copy
	}

	private static downloadData(data, fileName: string) {
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
