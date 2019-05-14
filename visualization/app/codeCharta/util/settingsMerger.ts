import { AttributeType, Edge, BlacklistItem, CCFile, FileSettings } from "../codeCharta.model"
import { CodeChartaService } from "../codeCharta.service"

export class SettingsMerger {
	private static edges: Edge[] = []
	private static blacklist: BlacklistItem[] = []
	private static attributeTypesEdge: { [key: string]: AttributeType } = {}
	private static attributeTypesNode: { [key: string]: AttributeType } = {}

	public static getMergedFileSettings(inputFiles: CCFile[], withUpdatedPath: boolean = false): FileSettings {
		if (inputFiles.length == 1) {
			return inputFiles[0].settings.fileSettings ? inputFiles[0].settings.fileSettings : null
		}

		this.resetVariables()

		for (let inputFile of inputFiles) {
			this.setEdges(inputFile, withUpdatedPath)
			this.setAttributeTypesByUniqueKey(inputFile)
			this.setBlacklist(inputFile, withUpdatedPath)
			// TODO: Merge markedPackages
		}
		return this.getNewFileSettings()
	}

	private static setEdges(inputFile: CCFile, withUpdatedPath: boolean) {
		if (!inputFile.settings.fileSettings.edges) {
			return
		}

		for (let oldEdge of inputFile.settings.fileSettings.edges as Edge[]) {
			let edge: Edge = {
				fromNodeName: withUpdatedPath
					? this.getUpdatedPath(inputFile.fileMeta.fileName, oldEdge.fromNodeName)
					: oldEdge.fromNodeName,
				toNodeName: withUpdatedPath ? this.getUpdatedPath(inputFile.fileMeta.fileName, oldEdge.toNodeName) : oldEdge.toNodeName,
				attributes: oldEdge.attributes,
				visible: oldEdge.visible
			}
			const equalEdgeItem = this.edges.find(e => e.fromNodeName == edge.fromNodeName && e.toNodeName == edge.toNodeName)

			if (equalEdgeItem) {
				for (let key in edge.attributes) {
					equalEdgeItem.attributes[key] = edge.attributes[key]
				}
			} else {
				this.edges.push(edge)
			}
		}
	}

	private static setBlacklist(inputFile: CCFile, withUpdatedPath: boolean) {
		if (!inputFile.settings.fileSettings.blacklist) {
			return
		}

		for (let oldBlacklistItem of inputFile.settings.fileSettings.blacklist as BlacklistItem[]) {
			let blacklistItem: BlacklistItem = {
				path: withUpdatedPath
					? this.getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldBlacklistItem.path)
					: oldBlacklistItem.path,
				type: oldBlacklistItem.type
			}
			const equalBlacklistItems = this.blacklist.filter(b => b.path == blacklistItem.path && b.type == blacklistItem.type)
			if (equalBlacklistItems.length == 0) {
				this.blacklist.push(blacklistItem)
			}
		}
	}

	private static getUpdatedBlacklistItemPath(fileName: string, path: string): string {
		if (this.isAbsoluteRootPath(path)) {
			return this.getUpdatedPath(fileName, path)
		}
		return path
	}

	private static isAbsoluteRootPath(path: string): boolean {
		return path.startsWith(CodeChartaService.ROOT_PATH + "/")
	}

	private static setAttributeTypesByUniqueKey(inputFile: CCFile) {
		const types = inputFile.settings.fileSettings.attributeTypes
		if (types && types.nodes) {
			for (let key in types.nodes) {
				this.attributeTypesNode[key] = types.nodes[key]
			}
		}
		if (types && types.edges) {
			for (let key in types.edges) {
				this.attributeTypesEdge[key] = types.edges[key]
			}
		}
	}

	private static getNewFileSettings(): FileSettings {
		return {
			edges: this.edges,
			blacklist: this.blacklist,
			attributeTypes: {
				nodes: this.attributeTypesNode,
				edges: this.attributeTypesEdge
			},
			markedPackages: []
		}
	}

	private static getUpdatedPath(fileName: string, path: string): string {
		const folderArray = path.split("/")
		folderArray.splice(2, 0, fileName)
		return folderArray.join("/")
	}

	private static resetVariables() {
		this.edges = []
		this.blacklist = []
		this.attributeTypesEdge = {}
		this.attributeTypesNode = {}
	}
}
