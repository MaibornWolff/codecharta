import { CodeMapNode } from "../codeCharta.model"

export class StreetLayoutHelper {
	public static calculateSize(node: CodeMapNode, metricName: string) {
		let totalSize = 0

		if (node.children && node.children.length > 0) {
			for (const child of node.children) {
				totalSize += StreetLayoutHelper.calculateSize(child, metricName)
			}
			return totalSize
		} else {
			return node.attributes[metricName] || 0
		}
	}
}
