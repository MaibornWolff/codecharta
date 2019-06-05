import angular from "angular"
import * as d3 from "d3"
import { CCFile, CodeMapNode, BlacklistType, BlacklistItem, FileSettings, ExportCCFile } from "../codeCharta.model"
import { DownloadCheckboxNames } from "../ui/dialog/dialog.download.component"

export class FileDownloader {
	private static CC_FILE_EXTENSION = ".cc.json"

	public static downloadCurrentMap(file: CCFile, downloadSettingsNames: string[], fileName: string) {
		const exportCCFile: ExportCCFile = this.getProjectDataAsCCJsonFormat(file, downloadSettingsNames)
		const newFileNameWithExtension: string = fileName + FileDownloader.CC_FILE_EXTENSION
		this.downloadData(exportCCFile, newFileNameWithExtension)
	}

	private static getProjectDataAsCCJsonFormat(file: CCFile, downloadSettingsNames: string[]) {
		const s: FileSettings = file.settings.fileSettings

		let downloadObject: ExportCCFile = {
			projectName: file.fileMeta.projectName,
			apiVersion: file.fileMeta.apiVersion,
			nodes: [this.removeJsonHashkeysAndVisibleAttribute(file.map)],
			attributeTypes: s.attributeTypes,
			edges: downloadSettingsNames.includes(DownloadCheckboxNames.edges) ? s.edges : [],
			markedPackages: downloadSettingsNames.includes(DownloadCheckboxNames.markedPackages) ? s.markedPackages : [],
			blacklist: this.getBlacklistToDownload(downloadSettingsNames, file)
		}
		return downloadObject
	}

	private static getBlacklistToDownload(downloadSettingsNames: string[], file: CCFile): BlacklistItem[] {
		let blacklist: BlacklistItem[] = []

		if (downloadSettingsNames.includes(DownloadCheckboxNames.hides)) {
			blacklist.push(...this.getFilteredBlacklist(file, BlacklistType.hide))
		}

		if (downloadSettingsNames.includes(DownloadCheckboxNames.excludes)) {
			blacklist.push(...this.getFilteredBlacklist(file, BlacklistType.exclude))
		}
		return blacklist
	}

	private static getFilteredBlacklist(file: CCFile, type: BlacklistType): BlacklistItem[] {
		return file.settings.fileSettings.blacklist.filter(x => x.type == type)
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
