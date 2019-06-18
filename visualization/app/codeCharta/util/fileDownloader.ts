import angular from "angular"
import * as d3 from "d3"
import { CodeMapNode, BlacklistType, BlacklistItem, FileSettings, ExportCCFile, FileMeta, AttributeTypes } from "../codeCharta.model"
import { DownloadCheckboxNames } from "../ui/dialog/dialog.download.component"
import { CodeChartaService } from "../codeCharta.service"

export class FileDownloader {
	public static downloadCurrentMap(
		map: CodeMapNode,
		fileMeta: FileMeta,
		fileSettings: FileSettings,
		downloadSettingsNames: string[],
		fileName: string
	) {
		const exportCCFile: ExportCCFile = this.getProjectDataAsCCJsonFormat(map, fileMeta, fileSettings, downloadSettingsNames)
		const newFileNameWithExtension: string = fileName + CodeChartaService.CC_FILE_EXTENSION
		this.downloadData(exportCCFile, newFileNameWithExtension)
	}

	private static getProjectDataAsCCJsonFormat(
		map: CodeMapNode,
		fileMeta: FileMeta,
		fileSettings: FileSettings,
		downloadSettingsNames: string[]
	): ExportCCFile {
		return {
			projectName: fileMeta.projectName,
			apiVersion: fileMeta.apiVersion,
			nodes: [this.removeJsonHashkeysAndVisibleAttribute(map)],
			attributeTypes: this.getAttributeTypesForJSON(fileSettings.attributeTypes),
			edges: downloadSettingsNames.includes(DownloadCheckboxNames.edges) ? fileSettings.edges : [],
			markedPackages: downloadSettingsNames.includes(DownloadCheckboxNames.markedPackages) ? fileSettings.markedPackages : [],
			blacklist: this.getBlacklistToDownload(downloadSettingsNames, fileSettings.blacklist)
		}
	}

	private static getBlacklistToDownload(downloadSettingsNames: string[], blacklist: BlacklistItem[]): BlacklistItem[] {
		let mergedBlacklist: BlacklistItem[] = []

		if (downloadSettingsNames.includes(DownloadCheckboxNames.hides)) {
			mergedBlacklist.push(...this.getFilteredBlacklist(blacklist, BlacklistType.hide))
		}

		if (downloadSettingsNames.includes(DownloadCheckboxNames.excludes)) {
			mergedBlacklist.push(...this.getFilteredBlacklist(blacklist, BlacklistType.exclude))
		}
		return mergedBlacklist
	}

	private static getAttributeTypesForJSON(attributeTypes: AttributeTypes): AttributeTypes | {} {
		if (attributeTypes.edges.length === 0 && attributeTypes.nodes.length === 0) {
			return {}
		} else {
			return attributeTypes
		}
	}

	private static getFilteredBlacklist(blacklist: BlacklistItem[], type: BlacklistType): BlacklistItem[] {
		return blacklist.filter(x => x.type == type)
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
