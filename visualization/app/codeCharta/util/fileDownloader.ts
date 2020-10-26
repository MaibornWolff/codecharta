import angular from "angular"
import { CodeMapNode, BlacklistType, BlacklistItem, FileSettings, FileMeta, AttributeTypes, Edge, NodeType } from "../codeCharta.model"
import { DownloadCheckboxNames } from "../ui/dialog/dialog.download.component"
import { CodeChartaService } from "../codeCharta.service"
import { ExportCCFile } from "../codeCharta.api.model"
import { NodeMetricDataService } from "../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { hierarchy } from "d3-hierarchy"
import { clone } from "./clone"

export class FileDownloader {
	static downloadCurrentMap(
		map: CodeMapNode,
		fileMeta: FileMeta,
		fileSettings: FileSettings,
		downloadSettingsNames: string[],
		fileName: string
	) {
		const exportCCFile = this.getProjectDataAsCCJsonFormat(map, fileMeta, fileSettings, downloadSettingsNames)
		const newFileNameWithExtension = fileName + CodeChartaService.CC_FILE_EXTENSION
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
			fileChecksum: undefined,
			nodes: [this.undecorateMap(map)],
			attributeTypes: this.getAttributeTypesForJSON(fileSettings.attributeTypes),
			edges: downloadSettingsNames.includes(DownloadCheckboxNames.edges) ? this.undecorateEdges(fileSettings.edges) : [],
			markedPackages: downloadSettingsNames.includes(DownloadCheckboxNames.markedPackages) ? fileSettings.markedPackages : [],
			blacklist: this.getBlacklistToDownload(downloadSettingsNames, fileSettings.blacklist)
		}
	}

	private static getBlacklistToDownload(downloadSettingsNames: string[], blacklist: BlacklistItem[]) {
		const mergedBlacklist = []

		if (downloadSettingsNames.includes(DownloadCheckboxNames.flattens)) {
			mergedBlacklist.push(
				...this.getFilteredBlacklist(blacklist, BlacklistType.flatten).map(x => {
					return { path: x.path, type: "hide" }
				})
			)
		}

		if (downloadSettingsNames.includes(DownloadCheckboxNames.excludes)) {
			mergedBlacklist.push(...this.getFilteredBlacklist(blacklist, BlacklistType.exclude))
		}
		return mergedBlacklist
	}

	private static getAttributeTypesForJSON(attributeTypes: AttributeTypes) {
		if (Object.keys(attributeTypes.edges).length === 0 && Object.keys(attributeTypes.nodes).length === 0) {
			return {}
		}
		return attributeTypes
	}

	private static getFilteredBlacklist(blacklist: BlacklistItem[], type: BlacklistType) {
		return blacklist.filter(x => x.type === type)
	}

	private static undecorateMap(map: CodeMapNode) {
		const copy = clone(map)
		for (const { data } of hierarchy(copy)) {
			delete data.isExcluded
			delete data.isFlattened
			delete data.edgeAttributes
			delete data.path
			if (data.type === NodeType.FOLDER) {
				data.attributes = {}
			} else {
				delete data.attributes[NodeMetricDataService.UNARY_METRIC]
			}
		}
		return copy
	}

	private static undecorateEdges(edges: Edge[]) {
		const copy = clone(edges)
		for (const edge of copy) {
			delete edge.visible
		}
		return copy
	}

	private static downloadData(data: ExportCCFile, fileName: string) {
		let dataJson = JSON.stringify(data)
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
