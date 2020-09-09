import { hierarchy } from "d3-hierarchy"
import { BlacklistItem, BlacklistType, CodeMapNode, MarkedPackage } from "../codeCharta.model"
import ignore from "ignore"

function getAnyCodeMapNodeFromPath(path: string, root: CodeMapNode): CodeMapNode {
	const matchingNode = hierarchy<CodeMapNode>(root)
		.descendants()
		.find(node => node.data.path === path)
	return matchingNode ? matchingNode.data : null
}

function getCodeMapNodeFromPath(path: string, nodeType: string, root: CodeMapNode): CodeMapNode {
	const matchingNode = hierarchy<CodeMapNode>(root)
		.descendants()
		.find(node => node.data.path === path && node.data.type === nodeType)
	return matchingNode ? matchingNode.data : null
}

function getAllPaths(node: CodeMapNode): Array<string> {
	return hierarchy<CodeMapNode>(node)
		.descendants()
		.map(node => node.data.path)
}

function transformPath(toTransform: string): string {
	let removeNumberOfCharactersFromStart = 0

	if (toTransform.startsWith("./")) {
		removeNumberOfCharactersFromStart = 2
	} else if (toTransform.startsWith("/")) {
		removeNumberOfCharactersFromStart = 1
	}
	return toTransform.substring(removeNumberOfCharactersFromStart)
}

function getNodesByGitignorePath(nodes: Array<CodeMapNode>, gitignorePath: string): CodeMapNode[] {
	const ignoredNodePaths = ignore()
		.add(transformPath(gitignorePath))
		.filter(nodes.map(n => transformPath(n.path)))
	//TODO: Review again once we use a isBlacklisted attribute in our CodeMapNodes
	const set = new Set(ignoredNodePaths)
	return nodes.filter(n => !set.has(transformPath(n.path)))
}

function numberOfBlacklistedNodes(nodes: Array<CodeMapNode>): number {
	return nodes.filter(node => isBlacklisted(node)).length
}

function isPathHiddenOrExcluded(path: string, blacklist: Array<BlacklistItem>): boolean {
	return isPathBlacklisted(path, blacklist, BlacklistType.exclude) || isPathBlacklisted(path, blacklist, BlacklistType.flatten)
}

function isPathBlacklisted(path: string, blacklist: Array<BlacklistItem>, type: BlacklistType): boolean {
	if (blacklist.length === 0) {
		return false
	}

	const ig = ignore().add(blacklist.filter(b => b.type === type).map(ex => transformPath(ex.path)))
	return ig.ignores(transformPath(path))
}

function getMarkingColor(node: CodeMapNode, markedPackages: MarkedPackage[]): string {
	let markingColor: string = null

	if (markedPackages) {
		const markedParentPackages = markedPackages.filter(mp => node.path.includes(mp.path))

		if (markedParentPackages.length > 0) {
			markedParentPackages.sort((a, b) => sortByPathLength(a, b))
			markingColor = markedParentPackages[0].color
		}
	}
	return markingColor
}

function sortByPathLength(a: MarkedPackage, b: MarkedPackage) {
	return b.path.length - a.path.length
}

function isBlacklisted(node: CodeMapNode): boolean {
	return node.isExcluded || node.isFlattened
}

export const CodeMapHelper = {
	getAnyCodeMapNodeFromPath,
	getNodesByGitignorePath,
	getAllPaths,
	transformPath,
	getCodeMapNodeFromPath,
	numberOfBlacklistedNodes,
	isPathHiddenOrExcluded,
	isPathBlacklisted,
	getMarkingColor
}
