import { CodeMapNode } from "../codeCharta.model"
import { LayoutHelper } from "./layoutHelper"

export class StreetLayoutHelper {
	public static countFileDescendants(folderNode: CodeMapNode): number {
		let totalFileNodes = 0
		for (const child of folderNode.children) {
			totalFileNodes += LayoutHelper.isNodeLeaf(child) ? 1 : StreetLayoutHelper.countFileDescendants(child)
		}
		return totalFileNodes
	}
}
