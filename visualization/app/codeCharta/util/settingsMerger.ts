import { Edge, BlacklistItem, CCFile, FileSettings, MarkedPackage, AttributeType } from "../model/codeCharta.model"
import { CodeChartaService } from "../codeCharta.service"
import _ from "lodash"

export class SettingsMerger {
	private static edges: Edge[] = []
	private static markedPackages: MarkedPackage[] = []
	private static blacklist: BlacklistItem[] = []
	private static attributeTypesEdge: AttributeType[] = []
	private static attributeTypesNode: AttributeType[] = []

	public static getMergedFileSettings(inputFiles: CCFile[], withUpdatedPath: boolean = false): FileSettings {
		if (inputFiles.length == 1) {
			return inputFiles[0].settings.fileSettings ? inputFiles[0].settings.fileSettings : null
		}

		this.resetVariables()

		for (let inputFile of inputFiles) {
			this.setEdges(inputFile, withUpdatedPath)
			this.setMarkedPackage(inputFile, withUpdatedPath)
			this.setAttributeTypesByUniqueKey(inputFile)
			this.setBlacklist(inputFile, withUpdatedPath)
		}
		return this.getNewFileSettings()
	}

	private static setEdges(inputFile: CCFile, withUpdatedPath: boolean) {
		if (inputFile.settings.fileSettings.edges) {
			for (let oldEdge of inputFile.settings.fileSettings.edges) {
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
	}

	private static setMarkedPackage(inputFile: CCFile, withUpdatedPath: boolean) {
		if (inputFile.settings.fileSettings.markedPackages) {
			for (let oldMarkedPackages of inputFile.settings.fileSettings.markedPackages) {
				let markedPackage: MarkedPackage = {
					path: withUpdatedPath
						? this.getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldMarkedPackages.path)
						: oldMarkedPackages.path,
					color: oldMarkedPackages.color,
					attributes: oldMarkedPackages.attributes
				}
				const equalMarkedPackages = this.markedPackages.find(x => x.path == markedPackage.path && x.color == markedPackage.color)

				if (equalMarkedPackages) {
					for (let key in markedPackage.attributes) {
						equalMarkedPackages.attributes[key] = markedPackage.attributes[key]
					}
				} else {
					this.markedPackages.push(markedPackage)
				}
			}
		}
	}

	private static setBlacklist(inputFile: CCFile, withUpdatedPath: boolean) {
		if (inputFile.settings.fileSettings.blacklist) {
			for (let oldBlacklistItem of inputFile.settings.fileSettings.blacklist) {
				let blacklistItem: BlacklistItem = {
					path: withUpdatedPath
						? this.getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldBlacklistItem.path)
						: oldBlacklistItem.path,
					type: oldBlacklistItem.type
				}
				const equalBlacklistItems = this.blacklist.find(b => b.path == blacklistItem.path && b.type == blacklistItem.type)

				if (!equalBlacklistItems) {
					this.blacklist.push(blacklistItem)
				}
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
		for (let i = 0; i < types.nodes.length; i++) {
			const key = _.findKey(types.nodes[i])
			if (!this.attributeTypesNode.find(x => _.findKey(x) === key)) {
				this.attributeTypesNode.push({ [key]: types.nodes[i][key] })
			}
		}

		for (let i = 0; i < types.edges.length; i++) {
			const key = _.findKey(types.edges[i])
			if (!this.attributeTypesEdge.find(x => _.findKey(x) === key)) {
				this.attributeTypesEdge.push({ [key]: types.edges[i][key] })
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
			markedPackages: this.markedPackages
		}
	}

	private static getUpdatedPath(fileName: string, path: string): string {
		const folderArray = path.split("/")
		folderArray.splice(2, 0, fileName)
		return folderArray.join("/")
	}

	private static resetVariables() {
		this.edges = []
		this.markedPackages = []
		this.blacklist = []
		this.attributeTypesEdge = []
		this.attributeTypesNode = []
	}
}
