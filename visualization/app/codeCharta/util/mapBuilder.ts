import { CodeMapNode } from "../codeCharta.model"
import { CodeChartaService } from "../codeCharta.service"

export class MapBuilder {
	static createCodeMapFromHashMap(hashMapWithAllNodes: Map<string, CodeMapNode>) {
		let rootNode: CodeMapNode
		for (const [path, node] of hashMapWithAllNodes) {
			if (path === CodeChartaService.ROOT_PATH) {
				rootNode = node
			} else {
				const parentNode = this.getParentNode(hashMapWithAllNodes, path)
				parentNode.children.push(node)
			}
		}
		return rootNode
	}

	private static getParentNode(hashMap: Map<string, CodeMapNode>, path: string): CodeMapNode {
		do {
			// TODO: Check what happens with Windows paths.
			path = path.slice(0, path.lastIndexOf("/"))

			const node = hashMap.get(path)
			if (node) {
				return node
			}
		} while (path !== CodeChartaService.ROOT_PATH)
	}
}
