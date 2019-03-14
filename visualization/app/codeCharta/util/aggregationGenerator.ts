import {AttributeType, CodeMapNode, Edge, BlacklistItem, CCFile} from "../codeCharta.model"

export class AggregationGenerator {

	private static projectNameArray = []
	private static fileNameArray = []
	private static edges: Edge[] = []
	private static blacklist: BlacklistItem[] = []
	private static attributeTypesEdge: { [key: string]: AttributeType } = {}
	private static attributeTypesNode: { [key: string]: AttributeType } = {}

	public static getAggregationFile(inputFiles: CCFile[]): CCFile {
		if (inputFiles.length == 1) {
			return inputFiles[0]
		}

		this.resetVariables()

		for (let inputFile of inputFiles) {
			this.projectNameArray.push(inputFile.fileMeta.projectName)
			this.fileNameArray.push(inputFile.fileMeta.fileName)
			this.setEdgesWithUpdatedPath(inputFile)
			this.setAttributeTypesByUniqueKey(inputFile)
			this.setBlacklistWithUpdatedPath(inputFile)
		}
		return this.getNewAggregatedMap(inputFiles)
	}

	private static setEdgesWithUpdatedPath(inputFile: CCFile) {
		if (!inputFile.settings.fileSettings.edges) {
			return
		}

		for (let oldEdge of inputFile.settings.fileSettings.edges as Edge[]) {
			let edge: Edge = {
				fromNodeName: this.getUpdatedPath(inputFile.fileMeta.fileName, oldEdge.fromNodeName),
				toNodeName: this.getUpdatedPath(inputFile.fileMeta.fileName, oldEdge.toNodeName),
				attributes: oldEdge.attributes,
				visible: oldEdge.visible
			}
			const equalEdgeItems = this.edges.filter(e => e.fromNodeName == edge.fromNodeName && e.toNodeName == edge.toNodeName)
			if (equalEdgeItems.length == 0) {
				this.edges.push(edge)
			}
		}
	}

	private static setBlacklistWithUpdatedPath(inputFile: CCFile) {
		if (!inputFile.settings.fileSettings.blacklist) {
			return
		}

		for (let oldBlacklistItem of inputFile.settings.fileSettings.blacklist as BlacklistItem[]) {
			let blacklistItem: BlacklistItem = {
				path: this.getUpdatedBlacklistItemPath(inputFile.fileMeta.fileName, oldBlacklistItem.path),
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
		return path.startsWith("/root/")
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

	private static getNewAggregatedMap(inputFiles: CCFile[]): CCFile {
		let outputFile: CCFile = {
			fileMeta: {
				projectName: "Aggregation of following projects: " + this.projectNameArray.join(", "),
				fileName: "Aggregation of following files: " + this.fileNameArray.join(", "),
				apiVersion: require("../../../package.json").codecharta.apiVersion
			},
			map: {
				name: "root",
				type: "Folder",
				children: [] as CodeMapNode[],
				attributes: {},
				origin: "Aggregation of following files: " + this.fileNameArray.join(", "),
				path: "/root",
				visible: true
			},
			settings: {
				fileSettings: {
					edges: this.edges,
					blacklist: this.blacklist,
					attributeTypes: {
						nodes: this.attributeTypesNode,
						edges: this.attributeTypesEdge
					}
				}
			}
		}

		for (let inputMap of inputFiles) {
			outputFile.map.children.push(this.extractNodeFromMap(inputMap))
		}
		this.aggregateRootAttributes(outputFile)
		return outputFile
	}

	private static aggregateRootAttributes(outputFile: CCFile) {
		outputFile.map.children.forEach(child => {
			let attributes = child.attributes
			for (let key in attributes) {
				if (!(key in outputFile.map.attributes)) {
					outputFile.map.attributes[key] = 0
				}
				outputFile.map.attributes[key] += attributes[key]
			}
		})
	}

	private static extractNodeFromMap(inputMap: CCFile): CodeMapNode {
		let outputNode: CodeMapNode = {
			name: inputMap.fileMeta.fileName,
			children: inputMap.map.children
		} as CodeMapNode

		if (inputMap.map.path) {
			outputNode.path = this.getUpdatedPath(inputMap.fileMeta.fileName, inputMap.map.path)
		}

		for (let key in inputMap.map) {
			if (!["name", "path", "children"].includes(key)) {
				outputNode[key] = inputMap.map[key]
			}
		}
		this.updatePathOfAllChildren(inputMap.fileMeta.fileName, outputNode.children)
		return outputNode
	}

	private static updatePathOfAllChildren(fileName: string, children: CodeMapNode[]) {
		for (let i = 0; i < children.length; i++) {
			if (children[i].path) {
				children[i].path = this.getUpdatedPath(fileName, children[i].path)
			}

			if (children[i].children) {
				this.updatePathOfAllChildren(fileName, children[i].children)
			}
		}
	}

	private static getUpdatedPath(fileName: string, path: string): string {
		const folderArray = path.split("/")
		folderArray.splice(2, 0, fileName)
		return folderArray.join("/")
	}

	private static resetVariables() {
		this.projectNameArray = []
		this.fileNameArray = []
		this.edges = []
		this.blacklist = []
		this.attributeTypesEdge = {}
		this.attributeTypesNode = {}
	}
}
