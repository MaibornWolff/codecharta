import { CodeMapNode, NodeType } from "../codeCharta.model"
import { CodeChartaService } from "../codeCharta.service"

export class MapBuilder {
	public static createCodeMapFromHashMap(hashMapWithAllNodes: Map<string, CodeMapNode>) {
		let rootNode = this.getEmptyRootNode()
		const sortedNodes = this.getHashMapSortedByPath(hashMapWithAllNodes)

		sortedNodes.forEach((node: CodeMapNode, path: string) => {
			node.children = []
			const parentNode = this.getParentNode(sortedNodes, path, rootNode)
			if (node.path === CodeChartaService.ROOT_PATH) {
				rootNode = node
			} else {
				parentNode.children.push(node)
			}
		})
		return rootNode
	}

	private static getEmptyRootNode(): CodeMapNode {
		return {
			name: CodeChartaService.ROOT_NAME,
			path: CodeChartaService.ROOT_PATH,
			type: NodeType.FOLDER,
			children: [],
			attributes: {}
		}
	}

	private static getHashMapSortedByPath(hashMap: Map<string, CodeMapNode>) {
		return new Map([...hashMap.entries()].sort((a, b) => a[0].length - b[0].length))
	}

	private static getParentPath(path: string) {
		return path.slice(0, Math.max(0, path.lastIndexOf("/")))
	}

	private static getParentNode(sortedHashMap: Map<string, CodeMapNode>, path: string, rootNode: CodeMapNode): CodeMapNode {
		if (path === CodeChartaService.ROOT_PATH) {
			return rootNode
		}

		const parentPath = this.getParentPath(path)

		const node = sortedHashMap.get(parentPath)
		if (node) {
			return node
		}

		return this.getParentNode(sortedHashMap, parentPath, rootNode)
	}
}
