import { CodeMapNode, CCFile, KeyValuePair, FileMeta } from "../codeCharta.model"
import { MapBuilder } from "./mapBuilder"
import { FileNameHelper } from "./fileNameHelper"
import { hierarchy } from "d3-hierarchy"
import packageJson from "../../../package.json"

export class DeltaGenerator {
	static getDeltaFile(referenceFile: CCFile, comparisonFile: CCFile) {
		// TODO: Only generate a single map for one side. The other side may use
		// that map during iteration as reference.
		const referenceHashMap = this.getCodeMapNodesAsHashMap(referenceFile.map)
		const comparisonHashMap = this.getCodeMapNodesAsHashMap(comparisonFile.map)
		const hashMapWithAllNodes = this.getHashMapWithAllNodes(referenceHashMap, comparisonHashMap)

		const fileMeta = this.getFileMetaData(referenceFile, comparisonFile)
		const map = MapBuilder.createCodeMapFromHashMap(hashMapWithAllNodes)
		return this.getNewCCFileWithDeltas(map, fileMeta)
	}

	private static getCodeMapNodesAsHashMap(rootNode: CodeMapNode) {
		const hashMap: Map<string, CodeMapNode> = new Map()

		for (const { data } of hierarchy(rootNode)) {
			data.children = []
			hashMap.set(data.path, data)
		}
		return hashMap
	}

	private static getHashMapWithAllNodes(referenceHashMap: Map<string, CodeMapNode>, comparisonHashMap: Map<string, CodeMapNode>) {
		const hashMapWithAllNodes: Map<string, CodeMapNode> = new Map()
		let newNode: CodeMapNode

		for (const [path, comparisonNode] of comparisonHashMap) {
			const referenceNode = referenceHashMap.get(path)
			if (referenceNode) {
				newNode = this.setDeltaProperties(referenceNode, referenceNode.attributes, comparisonNode.attributes)
			} else {
				newNode = this.setDeltaProperties(comparisonNode, {}, comparisonNode.attributes)
			}
			hashMapWithAllNodes.set(path, newNode)
		}

		for (const [path, referenceNode] of referenceHashMap) {
			if (!comparisonHashMap.get(path)) {
				const newNode = this.setDeltaProperties(referenceNode, referenceNode.attributes, {})
				hashMapWithAllNodes.set(newNode.path, newNode)
			}
		}
		return hashMapWithAllNodes
	}

	private static setDeltaProperties(node: CodeMapNode, referenceAttribute: KeyValuePair, comparisonAttribute: KeyValuePair) {
		node.children = []
		node.deltas = this.getDeltaAttributeList(referenceAttribute, comparisonAttribute)
		node.attributes = comparisonAttribute
		return node
	}

	private static getDeltaAttributeList(referenceAttribute: KeyValuePair, comparisonAttribute: KeyValuePair) {
		const deltaAttribute: KeyValuePair = {}

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
