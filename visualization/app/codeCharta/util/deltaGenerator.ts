import { CodeMapNode, CCFile, KeyValuePair, FileMeta } from "../codeCharta.model"
import { FileNameHelper } from "./fileNameHelper"
import { hierarchy } from "d3-hierarchy"
import packageJson from "../../../package.json"
import { CodeChartaService } from "../codeCharta.service"
import { getParent } from "./nodePathHelper"

export class DeltaGenerator {
	static createCodeMapFromHashMap(hashMapWithAllNodes: Map<string, CodeMapNode>) {
		let rootNode: CodeMapNode
		for (const [path, node] of hashMapWithAllNodes) {
			if (path === CodeChartaService.ROOT_PATH) {
				rootNode = node
			} else {
				const parentNode = getParent(hashMapWithAllNodes, path)
				parentNode.children.push(node)
			}
		}
		return rootNode
	}

	static getDeltaFile(referenceFile: CCFile, comparisonFile: CCFile) {
		const hashMapWithAllNodes = this.getHashMapWithAllNodes(referenceFile.map, comparisonFile.map)
		const map = this.createCodeMapFromHashMap(hashMapWithAllNodes)
		const fileMeta = this.getFileMetaData(referenceFile, comparisonFile)
		return this.getNewCCFileWithDeltas(map, fileMeta)
	}

	private static getHashMapWithAllNodes(referenceMap: CodeMapNode, comparisonMap: CodeMapNode) {
		const hashMapWithAllNodes: Map<string, CodeMapNode> = new Map()
		const referenceHashMap: Map<string, CodeMapNode> = new Map()

		// Get one side of the nodes
		for (const { data } of hierarchy(referenceMap)) {
			referenceHashMap.set(data.path, data)
		}

		// Combine both sides of the nodes
		for (const { data: comparisonNode } of hierarchy(comparisonMap)) {
			const referenceNode = referenceHashMap.get(comparisonNode.path)
			if (referenceNode) {
				if (referenceNode.children || comparisonNode.children) {
					referenceNode.children = []
				}
				referenceNode.deltas = this.getDeltaAttributeList(referenceNode.attributes, comparisonNode.attributes)
				// TODO: The attributes have to be consolidated to have a single set of
				// attributes instead of conflicting attributes. This applies to all
				// attributes and is not specific about the attributes from the
				// reference node.
				referenceNode.attributes = comparisonNode.attributes
			} else {
				if (comparisonNode.children) {
					comparisonNode.children = []
				}
				comparisonNode.deltas = { ...comparisonNode.attributes }
			}
			const node = referenceNode ?? comparisonNode
			hashMapWithAllNodes.set(node.path, node)
			referenceHashMap.delete(node.path)
		}

		// Add missing nodes
		for (const node of referenceHashMap.values()) {
			if (node.children) {
				node.children = []
			}
			node.deltas = {}
			for (const [key, value] of Object.entries(node.attributes)) {
				node.deltas[key] = -value
			}
			hashMapWithAllNodes.set(node.path, node)
		}

		return hashMapWithAllNodes
	}

	private static getDeltaAttributeList(referenceAttribute: KeyValuePair, comparisonAttribute: KeyValuePair) {
		const deltaAttribute: KeyValuePair = {}

		// TODO: All entries should have the combined attributes and deltas set,
		// even if they do not exist on one side. Calculate these attributes up
		// front. This operation is otherwise costly.
		for (const key of Object.keys(comparisonAttribute)) {
			deltaAttribute[key] = referenceAttribute[key] ? comparisonAttribute[key] - referenceAttribute[key] : comparisonAttribute[key]
		}

		for (const key of Object.keys(referenceAttribute)) {
			if (!comparisonAttribute[key]) {
				deltaAttribute[key] = -referenceAttribute[key]
			}
		}
		return deltaAttribute
	}

	private static getFileMetaData(referenceFile: CCFile, comparisonFile: CCFile): FileMeta {
		return {
			fileName: `delta_between_${FileNameHelper.withoutCCJsonExtension(
				referenceFile.fileMeta.fileName
			)}_and_${FileNameHelper.withoutCCJsonExtension(comparisonFile.fileMeta.fileName)}`,
			fileChecksum: `${referenceFile.fileMeta.fileChecksum};${comparisonFile.fileMeta.fileChecksum}`,
			apiVersion: packageJson.codecharta.apiVersion,
			projectName: `delta_between_${referenceFile.fileMeta.projectName}_and_${comparisonFile.fileMeta.projectName}`
		}
	}

	private static getNewCCFileWithDeltas(rootNode: CodeMapNode, fileMeta: FileMeta): CCFile {
		return {
			map: rootNode,
			fileMeta,
			settings: {
				fileSettings: {
					edges: [],
					blacklist: [],
					attributeTypes: { nodes: {}, edges: {} },
					markedPackages: []
				}
			}
		}
	}
}
