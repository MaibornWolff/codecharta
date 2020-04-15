import { CodeMapNode } from "../codeCharta.model"

export class StreetLayoutHelper {
	public static calculateSize(node: CodeMapNode, metricName: string) {
		let totalSize = node.attributes[metricName] || 0

		if (totalSize === 0 && node.children && node.children.length > 0) {
			for (const child of node.children) {
				totalSize += StreetLayoutHelper.calculateSize(child, metricName)
			}
		}
		return totalSize
	}

	public static countFileDescendants(folderNode: CodeMapNode): number {
		let totalFileNodes = 0
		for (const child of folderNode.children) {
			totalFileNodes += StreetLayoutHelper.isNodeLeaf(child) ? 1 : StreetLayoutHelper.countFileDescendants(child)
		}
		return totalFileNodes
	}

	public static isNodeLeaf(node: CodeMapNode): boolean {
		return !node.children || node.children.length === 0
	}

	public static mergeDirectories(node: CodeMapNode, metricName: string): CodeMapNode {
		let mergedNode = node
		for (const child of node.children) {
			if (!StreetLayoutHelper.isNodeLeaf(child)) {
				const nodeSize = StreetLayoutHelper.calculateSize(node, metricName)
				const childSize = StreetLayoutHelper.calculateSize(child, metricName)
				if (nodeSize === childSize) {
					mergedNode = child
					break
				}
			}
		}
		return mergedNode
	}
}
