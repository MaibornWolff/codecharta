import angular from "angular"
import * as d3 from "d3"
import _ from "lodash"
import { CodeMapNode, BlacklistType, BlacklistItem, FileSettings, ExportCCFile, FileMeta, AttributeTypes, Edge } from "../codeCharta.model"
import { DownloadCheckboxNames } from "../ui/dialog/dialog.download.component"
import { CodeChartaService } from "../codeCharta.service"
import { stringify } from "querystring"

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
			nodes: [this.undecorateMap(map)],
			attributeTypes: this.getAttributeTypesForJSON(fileSettings.attributeTypes),
			edges: downloadSettingsNames.includes(DownloadCheckboxNames.edges) ? this.undecorateEdges(fileSettings.edges) : [],
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

	private static undecorateMap(map: CodeMapNode): CodeMapNode {
		let copy: CodeMapNode = _.cloneDeep(map)
		d3.hierarchy(copy).each(node => {
			delete node.data.visible
			delete node.data.origin
			delete node.data.edgeAttributes
			delete node.data.path
			if (node.data.type === "Folder") {
				node.data.attributes = {}
			} else {
				delete node.data.attributes["unary"]
			}
		})
		return copy
	}

	private static undecorateEdges(edges: Edge[]): Edge[] {
		const copy: Edge[] = _.cloneDeep(edges)
		for (let edge of copy) {
			delete edge.visible
		}
		return copy
	}

	private static downloadData(data: ExportCCFile, fileName: string) {
		let dataJson = stringify(data)
		if (typeof data === "object") {
			dataJson = angular.toJson(data)
		}

		const blob = new Blob([dataJson], { type: "text/json" })
		const mouseEvent = document.createEvent("MouseEvents")
		const link = document.createElement("a")

		link.download = fileName
		link.href = window.URL.createObjectURL(blob)
		link.dataset.downloadurl = ["text/json", link.download, link.href].join(":")
		mouseEvent.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
		link.dispatchEvent(mouseEvent)
	}
}
