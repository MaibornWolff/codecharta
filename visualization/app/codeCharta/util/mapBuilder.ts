import { CodeMapNode } from "../codeCharta.model"
import { CodeChartaService } from "../codeCharta.service"

export class MapBuilder {
	// TODO: Check if it's fine to keep this unordered.
	static createCodeMapFromHashMap(hashMapWithAllNodes: Map<string, CodeMapNode>) {
		let rootNode: CodeMapNode
		for (const [path, node] of hashMapWithAllNodes) {
			node.children = []
			const parentNode = this.getParentNode(hashMapWithAllNodes, path)
			if (node.path === CodeChartaService.ROOT_PATH) {
				rootNode = node
			} else {
				parentNode.children.push(node)
			}
		}
		return rootNode
	}

	private static getParentNode(hashMap: Map<string, CodeMapNode>, path: string): CodeMapNode {
		if (path === CodeChartaService.ROOT_PATH) {
			return
		}

		// TODO: Check what happens with Windows paths.
		const parentPath = path.slice(0, path.lastIndexOf("/"))

		const node = hashMap.get(parentPath)
		if (node) {
			return node
		}

		return this.getParentNode(hashMap, parentPath)
	}
}
