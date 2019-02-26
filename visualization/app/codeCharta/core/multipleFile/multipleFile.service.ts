import { AttributeType, CodeMap, CodeMapNode, Edge, BlacklistItem } from "../data/model/CodeMap"

export class MultipleFileService {
	public static SELECTOR = "multipleFileService"
	private projectNameArray = []
	private fileNameArray = []
	private edges: Edge[] = []
	private blacklist: BlacklistItem[] = []
	private attributeTypesEdge: { [key: string]: AttributeType } = {}
	private attributeTypesNode: { [key: string]: AttributeType } = {}

	public aggregateMaps(inputMaps: CodeMap[]): CodeMap {
		if (inputMaps.length == 1) {
			return inputMaps[0]
		}

		this.resetVariables()

		for (let inputMap of inputMaps) {
			this.projectNameArray.push(inputMap.projectName)
			this.fileNameArray.push(inputMap.fileName)
			this.setEdgesWithUpdatedPath(inputMap)
			this.setAttributeTypesByUniqueKey(inputMap)
			this.setBlacklistWithUpdatedPath(inputMap)
		}
		return this.getNewAggregatedMap(inputMaps)
	}

	private setEdgesWithUpdatedPath(inputMap) {
		if (!inputMap.edges) {
			return
		}

		for (let oldEdge of inputMap.edges) {
			let edge: Edge = {
				fromNodeName: this.getUpdatedPath(inputMap.fileName, oldEdge.fromNodeName),
				toNodeName: this.getUpdatedPath(inputMap.fileName, oldEdge.toNodeName),
				attributes: oldEdge.attributes,
				visible: oldEdge.visible
			}
			const equalEdgeItems = this.edges.filter(e => e.fromNodeName == edge.fromNodeName && e.toNodeName == edge.toNodeName)
			if (equalEdgeItems.length == 0) {
				this.edges.push(edge)
			}
		}
	}

	private setBlacklistWithUpdatedPath(inputMap) {
		if (!inputMap.blacklist) {
			return
		}

		for (let oldBlacklistItem of inputMap.blacklist) {
			let blacklistItem: BlacklistItem = {
				path: this.getUpdatedBlacklistItemPath(inputMap.fileName, oldBlacklistItem.path),
				type: oldBlacklistItem.type
			}
			const equalBlacklistItems = this.blacklist.filter(b => b.path == blacklistItem.path && b.type == blacklistItem.type)
			if (equalBlacklistItems.length == 0) {
				this.blacklist.push(blacklistItem)
			}
		}
	}

	private getUpdatedBlacklistItemPath(fileName, path) {
		if (this.isAbsoluteRootPath(path)) {
			return this.getUpdatedPath(fileName, path)
		}
		return path
	}

	private isAbsoluteRootPath(path: string) {
		return path.startsWith("/root/")
	}

	private setAttributeTypesByUniqueKey(inputMap) {
		const types = inputMap.attributeTypes
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

	private getNewAggregatedMap(inputMaps): CodeMap {
		let outputMap: CodeMap = {
			projectName: "Aggregation of following projects: " + this.projectNameArray.join(", "),
			fileName: "Aggregation of following files: " + this.fileNameArray.join(", "),
			nodes: {
				name: "root",
				type: "Folder",
				children: [] as CodeMapNode[],
				attributes: {},
				origin: "Aggregation of following files: " + this.fileNameArray.join(", "),
				path: "/root",
				visible: true
			},
			edges: this.edges,
			blacklist: this.blacklist,
			attributeTypes: {
				nodes: this.attributeTypesNode,
				edges: this.attributeTypesEdge
			}
		}

		for (let inputMap of inputMaps) {
			outputMap.nodes.children.push(this.extractNodeFromMap(inputMap))
		}
		this.aggregateRootAttributes(outputMap)
		return outputMap
	}

	private aggregateRootAttributes(map: CodeMap) {
		map.nodes.children.forEach(child => {
			let attributes = child.attributes
			for (let key in attributes) {
				if (!(key in map.nodes.attributes)) {
					map.nodes.attributes[key] = 0
				}
				map.nodes.attributes[key] += attributes[key]
			}
		})
	}

	private extractNodeFromMap(inputCodeMap: CodeMap): CodeMapNode {
		let outputNode: CodeMapNode = {
			name: inputCodeMap.fileName,
			children: inputCodeMap.nodes.children
		} as CodeMapNode

		if (inputCodeMap.nodes.path) {
			outputNode.path = this.getUpdatedPath(inputCodeMap.fileName, inputCodeMap.nodes.path)
		}

		for (let key in inputCodeMap.nodes) {
			if (!["name", "path", "children"].includes(key)) {
				outputNode[key] = inputCodeMap.nodes[key]
			}
		}
		this.updatePathOfAllChildren(inputCodeMap.fileName, outputNode.children)
		return outputNode
	}

	private updatePathOfAllChildren(fileName, children: CodeMapNode[]) {
		for (let i = 0; i < children.length; i++) {
			if (children[i].path) {
				children[i].path = this.getUpdatedPath(fileName, children[i].path)
			}

			if (children[i].children) {
				this.updatePathOfAllChildren(fileName, children[i].children)
			}
		}
	}

	private getUpdatedPath(fileName, path) {
		const folderArray = path.split("/")
		folderArray.splice(2, 0, fileName)
		return folderArray.join("/")
	}

	private resetVariables() {
		this.projectNameArray = []
		this.fileNameArray = []
		this.edges = []
		this.blacklist = []
		this.attributeTypesEdge = {}
		this.attributeTypesNode = {}
	}
}
