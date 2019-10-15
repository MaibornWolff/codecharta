import { hierarchy } from "d3-hierarchy"
import { MarkedPackage } from "../codeCharta.model"
import ignore from "ignore"
import { CodeMapNode, BlacklistItem, BlacklistType } from "../codeCharta.model"

export class CodeMapHelper {
	public static getAnyCodeMapNodeFromPath(path: string, root: CodeMapNode): CodeMapNode {
		const firstTryNode = this.getCodeMapNodeFromPath(path, "File", root)
		if (!firstTryNode) {
			return this.getCodeMapNodeFromPath(path, "Folder", root)
		}
		return firstTryNode
	}

	public static getCodeMapNodeFromPath(path: string, nodeType: string, root: CodeMapNode): CodeMapNode {
		const matchingNode = hierarchy<CodeMapNode>(root)
			.descendants()
			.find(node => node.data.path === path && node.data.type === nodeType)
		return matchingNode ? matchingNode.data : null
	}

	public static transformPath(toTransform: string): string {
		let removeNumberOfCharactersFromStart = 0

		if (toTransform.startsWith("./")) {
			removeNumberOfCharactersFromStart = 2
		} else if (toTransform[0] === "/") {
			removeNumberOfCharactersFromStart = 1
		}
		return toTransform.substring(removeNumberOfCharactersFromStart)
	}

	public static getNodesByGitignorePath(nodes: Array<CodeMapNode>, gitignorePath: string): CodeMapNode[] {
		const ignoredNodePaths = ignore()
			.add(CodeMapHelper.transformPath(gitignorePath))
			.filter(nodes.map(n => CodeMapHelper.transformPath(n.path)))
		return nodes.filter(n => !ignoredNodePaths.includes(CodeMapHelper.transformPath(n.path)))
	}

	public static numberOfBlacklistedNodes(nodes: Array<CodeMapNode>, blacklist: Array<BlacklistItem>): number {
		if (blacklist) {
			const ig = ignore().add(blacklist.map(ex => CodeMapHelper.transformPath(ex.path)))
			const filteredNodes = ig.filter(nodes.map(n => CodeMapHelper.transformPath(n.path)))
			return nodes.length - filteredNodes.length
		} else {
			return 0
		}
	}

	public static isBlacklisted(node: CodeMapNode, blacklist: Array<BlacklistItem>, type: BlacklistType): boolean {
		return CodeMapHelper.isPathBlacklisted(node.path, blacklist, type)
	}

	public static isPathBlacklisted(path: string, blacklist: Array<BlacklistItem>, type: BlacklistType): boolean {
		if (blacklist.length === 0) {
			return false
		}

		const ig = ignore().add(blacklist.filter(b => b.type === type).map(ex => CodeMapHelper.transformPath(ex.path)))
		return ig.ignores(CodeMapHelper.transformPath(path))
	}

	public static getMarkingColor(node: CodeMapNode, markedPackages: MarkedPackage[]): string {
		let markingColor: string = null

		if (markedPackages) {
			let markedParentPackages = markedPackages.filter(mp => node.path.includes(mp.path))

			if (markedParentPackages.length > 0) {
				let sortedMarkedParentPackages = markedParentPackages.sort((a, b) => this.sortByPathLength(a, b))
				markingColor = sortedMarkedParentPackages[0].color
			}
		}
		return markingColor
	}

	private static sortByPathLength(a: MarkedPackage, b: MarkedPackage) {
		return b.path.length - a.path.length
	}
}
