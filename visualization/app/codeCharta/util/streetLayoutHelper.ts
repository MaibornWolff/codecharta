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
}
