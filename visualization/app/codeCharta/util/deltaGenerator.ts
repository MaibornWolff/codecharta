import { CodeMapNode, CCFile, KeyValuePair, FileMeta } from "../codeCharta.model"
import { MapBuilder } from "./mapBuilder"
import { FileNameHelper } from "./fileNameHelper"
import { hierarchy } from "d3-hierarchy"
import packageJson from "../../../package.json"

export class DeltaGenerator {
	static getDeltaFile(referenceFile: CCFile, comparisonFile: CCFile) {
		const referenceHashMap: Map<string, CodeMapNode> = this.getCodeMapNodesAsHashMap(referenceFile.map)
		const comparisonHashMap: Map<string, CodeMapNode> = this.getCodeMapNodesAsHashMap(comparisonFile.map)
		const hashMapWithAllNodes: Map<string, CodeMapNode> = this.getHashMapWithAllNodes(referenceHashMap, comparisonHashMap)

		const fileMeta = this.getFileMetaData(referenceFile, comparisonFile)
		const map = MapBuilder.createCodeMapFromHashMap(hashMapWithAllNodes)
		return this.getNewCCFileWithDeltas(map, fileMeta)
	}

	private static getCodeMapNodesAsHashMap(rootNode: CodeMapNode) {
		const hashMap = new Map<string, CodeMapNode>()

		hierarchy(rootNode)
			.descendants()
			.forEach(({ data }) => {
				data.children = []
				hashMap.set(data.path, data)
			})
		return hashMap
	}

	private static getHashMapWithAllNodes(referenceHashMap: Map<string, CodeMapNode>, comparisonHashMap: Map<string, CodeMapNode>) {
		const hashMapWithAllNodes: Map<string, CodeMapNode> = new Map<string, CodeMapNode>()

		comparisonHashMap.forEach((comparisonNode: CodeMapNode, path: string) => {
			const referenceNode = referenceHashMap.get(path)
			if (referenceNode) {
				const newNode = this.getNewDeltaNode(referenceNode, referenceNode.attributes, comparisonNode.attributes)
				hashMapWithAllNodes.set(path, newNode)
			} else {
				const newNode = this.getNewDeltaNode(comparisonNode, {}, comparisonNode.attributes)
				hashMapWithAllNodes.set(path, newNode)
			}
		})

		referenceHashMap.forEach((referenceNode: CodeMapNode, path: string) => {
			if (!comparisonHashMap.get(path)) {
				const newNode = this.getNewDeltaNode(referenceNode, referenceNode.attributes, {})
				hashMapWithAllNodes.set(newNode.path, newNode)
			}
		})
		return hashMapWithAllNodes
	}

	private static getNewDeltaNode(node: CodeMapNode, referenceAttribute: KeyValuePair, comparisonAttribute: KeyValuePair) {
		node.children = []
		node.deltas = this.getDeltaAttributeList(referenceAttribute, comparisonAttribute)
		node.attributes = comparisonAttribute
		return node
	}

	private static getDeltaAttributeList(referenceAttribute: KeyValuePair, comparisonAttribute: KeyValuePair) {
		const deltaAttribute: KeyValuePair = {}

		Object.keys(comparisonAttribute).forEach((key: string) => {
			deltaAttribute[key] = referenceAttribute[key] ? comparisonAttribute[key] - referenceAttribute[key] : comparisonAttribute[key]
		})

		Object.keys(referenceAttribute).forEach((key: string) => {
			if (!comparisonAttribute[key]) {
				deltaAttribute[key] = -referenceAttribute[key]
			}
		})
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
