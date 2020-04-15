import { hierarchy } from "d3-hierarchy"
import { MarkedPackage, NodeType } from "../codeCharta.model"
import ignore from "ignore"
import { CodeMapNode, BlacklistItem, BlacklistType } from "../codeCharta.model"

export class CodeMapHelper {
	public static getAnyCodeMapNodeFromPath(path: string, root: CodeMapNode): CodeMapNode {
		const firstTryNode = this.getCodeMapNodeFromPath(path, NodeType.FILE, root)
		if (!firstTryNode) {
			return this.getCodeMapNodeFromPath(path, NodeType.FOLDER, root)
		}
		return firstTryNode
	}

	public static getCodeMapNodeFromPath(path: string, nodeType: string, root: CodeMapNode): CodeMapNode {
		const matchingNode = hierarchy<CodeMapNode>(root)
			.descendants()
			.find(node => node.data.path === path && node.data.type === nodeType)
		return matchingNode ? matchingNode.data : null
	}

	public static getAllPaths(node: CodeMapNode): Array<String> {
		return hierarchy<CodeMapNode>(node)
			.descendants()
			.map(node => node.data.path)
	}

	public static transformPath(toTransform: string): string {
		let removeNumberOfCharactersFromStart = 0

		if (toTransform.startsWith("./")) {
			removeNumberOfCharactersFromStart = 2
		} else if (toTransform.startsWith("/")) {
			removeNumberOfCharactersFromStart = 1
		}
		return toTransform.substring(removeNumberOfCharactersFromStart)
	}

	public static getNodesByGitignorePath(nodes: Array<CodeMapNode>, gitignorePath: string): CodeMapNode[] {
		const ignoredNodePaths = ignore()
			.add(CodeMapHelper.transformPath(gitignorePath))
			.filter(nodes.map(n => CodeMapHelper.transformPath(n.path)))
		//TODO: Review again once we use a isBlacklisted attribute in our CodeMapNodes
		const set = new Set(ignoredNodePaths)
		return nodes.filter(n => !set.has(CodeMapHelper.transformPath(n.path)))
	}

	public static numberOfBlacklistedNodes(nodes: Array<CodeMapNode>): number {
		return nodes.filter(node => node.isBlacklisted).length
	}

	public static isPathHiddenOrExcluded(path: string, blacklist: Array<BlacklistItem>): boolean {
		return (
			CodeMapHelper.isPathBlacklisted(path, blacklist, BlacklistType.exclude) ||
			CodeMapHelper.isPathBlacklisted(path, blacklist, BlacklistType.flatten)
		)
	}

	public static isBlacklisted(node: CodeMapNode, type: BlacklistType): boolean {
		return node.isBlacklisted === type
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
