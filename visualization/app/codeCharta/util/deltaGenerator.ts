import { CCFile, CodeMapNode, FileMeta, KeyValuePair, NodeType } from "../codeCharta.model"
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
		const deltaNodesByPath = this.getDeltaNodesByPath(referenceFile.map, comparisonFile.map)
		const map = this.createCodeMapFromHashMap(deltaNodesByPath)
		const fileMeta = this.getFileMetaData(referenceFile, comparisonFile)
		return this.getNewCCFileWithDeltas(map, fileMeta)
	}

	private static getDeltaNodesByPath(referenceMap: CodeMapNode, comparisonMap: CodeMapNode) {
		const deltaNodesByPath = new Map<string, CodeMapNode>()
		const referenceNodesByPath = this.getReferenceNodesByPath(referenceMap)

		this.addExistingAndNewNodesToDeltaMap(referenceNodesByPath, comparisonMap, deltaNodesByPath)

		this.addDeletedNodesToDeltaMap(referenceNodesByPath, deltaNodesByPath)

		return deltaNodesByPath
	}

	private static getReferenceNodesByPath(referenceMap: CodeMapNode) {
		const referenceNodesByPath = new Map<string, CodeMapNode>()
		for (const { data } of hierarchy(referenceMap)) {
			referenceNodesByPath.set(data.path, data)
		}
		return referenceNodesByPath
	}

	private static addExistingAndNewNodesToDeltaMap(
		referenceNodesByPath: Map<string, CodeMapNode>,
		comparisonMap: CodeMapNode,
		deltaNodesByPath: Map<string, CodeMapNode>
	) {
		for (const { data: comparisonNode } of hierarchy(comparisonMap)) {
			const referenceNode = referenceNodesByPath.get(comparisonNode.path)
			if (referenceNode) {
				if (referenceNode.children || comparisonNode.children) {
					referenceNode.children = []
				}
				const changed = this.compareCommonAttributes(referenceNode, comparisonNode).differenceExists ? 1 : 0
				referenceNode.deltas = this.getDeltaAttributeList(referenceNode.attributes, comparisonNode.attributes)
				// TODO: The attributes have to be consolidated to have a single set of
				// attributes instead of conflicting attributes. This applies to all
				// attributes and is not specific about the attributes from the
				// reference node.
				referenceNode.attributes = comparisonNode.attributes
				referenceNode.fileCount = { added: 0, removed: 0, changed }
			} else {
				if (comparisonNode.children) {
					comparisonNode.children = []
				}
				comparisonNode.deltas = { ...comparisonNode.attributes }

				comparisonNode.fileCount = {
					added: comparisonNode.type === NodeType.FILE ? 1 : 0,
					removed: 0,
					changed: 0
				}
			}

			const node = referenceNode ?? comparisonNode
			deltaNodesByPath.set(node.path, node)
			referenceNodesByPath.delete(node.path)
		}
	}

	private static compareCommonAttributes(nodeA: CodeMapNode, nodeB: CodeMapNode): { differenceExists: boolean } {
		const nodesAreComparable = nodeA.type === NodeType.FILE && nodeB.type === NodeType.FILE && nodeA.attributes && nodeB.attributes

		if (!nodesAreComparable) {
			return { differenceExists: false }
		}

		const differenceExists = Object.keys(nodeA.attributes).some(attribute => {
			const bHasAttribute = nodeB.attributes[attribute] !== undefined
			const valuesDiffer = nodeB.attributes[attribute] !== nodeA.attributes[attribute]
			return bHasAttribute && valuesDiffer
		})
		return { differenceExists }
	}

	private static addDeletedNodesToDeltaMap(referenceNodesByPath: Map<string, CodeMapNode>, deltaNodesByPath: Map<string, CodeMapNode>) {
		for (const node of referenceNodesByPath.values()) {
			if (node.children) {
				node.children = []
			}
			node.deltas = {}
			node.fileCount = {
				added: 0,
				removed: node.type === NodeType.FILE ? 1 : 0,
				changed: 0
			}

			for (const [key, value] of Object.entries(node.attributes)) {
				node.deltas[key] = -value
			}

			deltaNodesByPath.set(node.path, node)
		}
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
			fileName: `delta_between_${FileNameHelper.withoutCCExtension(
				referenceFile.fileMeta.fileName
			)}_and_${FileNameHelper.withoutCCExtension(comparisonFile.fileMeta.fileName)}`,
			fileChecksum: `${referenceFile.fileMeta.fileChecksum};${comparisonFile.fileMeta.fileChecksum}`,
			apiVersion: packageJson.codecharta.apiVersion,
			projectName: `delta_between_${referenceFile.fileMeta.projectName}_and_${comparisonFile.fileMeta.projectName}`,
			exportedFileSize: referenceFile.fileMeta.exportedFileSize + comparisonFile.fileMeta.exportedFileSize
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
