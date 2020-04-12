import { CodeMapNode, NodeType } from "../codeCharta.model"
import { CodeChartaService } from "../codeCharta.service"

export class MapBuilder {
	public static createCodeMapFromHashMap(hashMapWithAllNodes: Map<string, CodeMapNode>): CodeMapNode {
		let rootNode: CodeMapNode = this.getEmptyRootNode()

		this.getHashMapSortedByPath(hashMapWithAllNodes).forEach((node: CodeMapNode, path: string) => {
			node.children = []
			const parentNode: CodeMapNode = this.findNode(rootNode, this.getParentPath(path))
			if (node.path == CodeChartaService.ROOT_PATH) {
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
			attributes: {},
			isBlacklisted: undefined
		}
	}

	private static getHashMapSortedByPath(hashMap: Map<string, CodeMapNode>): Map<string, CodeMapNode> {
		return new Map([...hashMap.entries()].sort((a, b) => a[0].length - b[0].length))
	}

	private static getParentPath(path: string): string {
		const parentPathArray = path.split("/")
		parentPathArray.splice(parentPathArray.length - 1, 1)
		return parentPathArray.length == 1 ? "/" : parentPathArray.join("/")
	}

	private static findNode(parent: CodeMapNode, path: string): CodeMapNode {
		if (parent.path == path || path == "/") {
			return parent
		} else {
			if (parent.children && parent.children.length > 0) {
				for (const child of parent.children) {
					const foundNode = this.findNode(child, path)
					if (foundNode) {
						return foundNode
					}
				}
			}
		}
	}
}
