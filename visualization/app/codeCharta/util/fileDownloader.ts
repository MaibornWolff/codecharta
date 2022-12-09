import {
	AttributeDescriptors,
	AttributeTypes,
	BlacklistItem,
	BlacklistType,
	CodeMapNode,
	Edge,
	FileMeta,
	FileSettings,
	NodeType
} from "../codeCharta.model"
import { LoadFileService } from "../services/loadFile/loadFile.service"
import { ExportCCFile } from "../codeCharta.api.model"
import { hierarchy } from "d3-hierarchy"
import { clone } from "./clone"
import { UNARY_METRIC } from "../state/selectors/accumulatedData/metricData/nodeMetricData.selector"

export type DownloadableSetting = "Nodes" | "AttributeTypes" | "AttributeDescriptors" | "Edges" | "Excludes" | "Flattens" | "MarkedPackages"

export class FileDownloader {
	static downloadCurrentMap(
		map: CodeMapNode,
		fileMeta: FileMeta,
		fileSettings: FileSettings,
		downloadSettings: DownloadableSetting[],
		fileName: string
	) {
		const exportCCFile = this.getProjectDataAsCCJsonFormat(map, fileMeta, fileSettings, downloadSettings)
		const newFileNameWithExtension = fileName + LoadFileService.CC_FILE_EXTENSION
		this.downloadData(JSON.stringify(exportCCFile), newFileNameWithExtension)
	}

	private static getProjectDataAsCCJsonFormat(
		map: CodeMapNode,
		fileMeta: FileMeta,
		fileSettings: FileSettings,
		downloadSettings: DownloadableSetting[]
	): ExportCCFile {
		return {
			projectName: fileMeta.projectName,
			apiVersion: fileMeta.apiVersion,
			fileChecksum: fileMeta.fileChecksum,
			nodes: [this.undecorateMap(map)],
			attributeTypes: downloadSettings.includes("AttributeTypes") ? this.getAttributeTypesForJSON(fileSettings.attributeTypes) : {},
			attributeDescriptors: downloadSettings.includes("AttributeDescriptors")
				? this.getAttributeDescriptorsForJSON(fileSettings.attributeDescriptors)
				: {},
			edges: downloadSettings.includes("Edges") ? this.undecorateEdges(fileSettings.edges) : [],
			markedPackages: downloadSettings.includes("MarkedPackages") ? fileSettings.markedPackages : [],
			blacklist: this.getBlacklistToDownload(downloadSettings, fileSettings.blacklist)
		}
	}

	private static getBlacklistToDownload(downloadSettings: DownloadableSetting[], blacklist: BlacklistItem[]) {
		const mergedBlacklist = []

		if (downloadSettings.includes("Flattens")) {
			mergedBlacklist.push(
				...this.getFilteredBlacklist(blacklist, BlacklistType.flatten).map(x => {
					return { path: x.path, type: "hide" }
				})
			)
		}

		if (downloadSettings.includes("Excludes")) {
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

	private static getAttributeDescriptorsForJSON(attributeDescriptors: AttributeDescriptors) {
		if (Object.keys(attributeDescriptors).length === 0) {
			return {}
		}
		return attributeDescriptors
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
				delete data.attributes[UNARY_METRIC]
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

	static downloadData(data: string, fileName: string) {
		const blob = new Blob([data], { type: "text/json" })
		const mouseEvent = document.createEvent("MouseEvents")
		const link = document.createElement("a")

		link.download = fileName
		link.href = window.URL.createObjectURL(blob)
		link.dataset.downloadurl = ["text/json", link.download, link.href].join(":")
		mouseEvent.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
		link.dispatchEvent(mouseEvent)
	}
}
