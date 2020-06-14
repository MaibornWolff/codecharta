import * as d3 from "d3"
import { CodeMapNode, CCFile, KeyValuePair, FileMeta } from "../codeCharta.model"
import _ from "lodash"
import { MapBuilder } from "./mapBuilder"
import { FileNameHelper } from "./fileNameHelper"
import { clone } from "./clone"
import { getAPIVersion } from "./version"

export class DeltaGenerator {
	public static getDeltaFile(referenceFile: CCFile, comparisonFile: CCFile): CCFile {
		const referenceHashMap: Map<string, CodeMapNode> = this.getCodeMapNodesAsHashMap(clone(referenceFile.map))
		const comparisonHashMap: Map<string, CodeMapNode> = this.getCodeMapNodesAsHashMap(clone(comparisonFile.map))
		const hashMapWithAllNodes: Map<string, CodeMapNode> = this.getHashMapWithAllNodes(referenceHashMap, comparisonHashMap)

		const fileMeta = this.getFileMetaData(referenceFile, comparisonFile)
		const map = MapBuilder.createCodeMapFromHashMap(hashMapWithAllNodes)
		return this.getNewCCFileWithDeltas(map, fileMeta)
	}

	private static getCodeMapNodesAsHashMap(rootNode: CodeMapNode): Map<string, CodeMapNode> {
		const hashMap = new Map<string, CodeMapNode>()

		d3.hierarchy(rootNode)
			.descendants()
			.map(x => x.data)
			.forEach((node: CodeMapNode) => {
				node.children = []
				hashMap.set(node.path, node)
			})
		return hashMap
	}

	private static getHashMapWithAllNodes(
		referenceHashMap: Map<string, CodeMapNode>,
		comparisonHashMap: Map<string, CodeMapNode>
	): Map<string, CodeMapNode> {
		const hashMapWithAllNodes: Map<string, CodeMapNode> = new Map<string, CodeMapNode>()

		comparisonHashMap.forEach((comparisonNode: CodeMapNode, path: string) => {
			const referenceNode: CodeMapNode = referenceHashMap.get(path)
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

	private static getNewDeltaNode(node: CodeMapNode, referenceAttr: KeyValuePair, comparisonAttr: KeyValuePair): CodeMapNode {
		node.children = []
		node.deltas = this.getDeltaAttributeList(referenceAttr, comparisonAttr)
		node.attributes = comparisonAttr
		return node
	}

	private static getDeltaAttributeList(referenceAttr: KeyValuePair, comparisonAttr: KeyValuePair): KeyValuePair {
		const deltaAttr = {}

		_.keys(comparisonAttr).forEach((key: string) => {
			deltaAttr[key] = referenceAttr[key] ? comparisonAttr[key] - referenceAttr[key] : comparisonAttr[key]
		})

		_.keys(referenceAttr).forEach((key: string) => {
			if (!comparisonAttr[key]) {
				deltaAttr[key] = -referenceAttr[key]
			}
		})
		return deltaAttr
	}

	private static getFileMetaData(referenceFile: CCFile, comparisonFile: CCFile): FileMeta {
		return {
			fileName:
				"delta_between_" +
				FileNameHelper.withoutCCJsonExtension(referenceFile.fileMeta.fileName) +
				"_and_" +
				FileNameHelper.withoutCCJsonExtension(comparisonFile.fileMeta.fileName),
			apiVersion: getAPIVersion(),
			projectName: "delta_between_" + referenceFile.fileMeta.projectName + "_and_" + comparisonFile.fileMeta.projectName
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
