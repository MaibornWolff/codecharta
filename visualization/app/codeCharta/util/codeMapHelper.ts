import { hierarchy } from "d3-hierarchy"
import { BlacklistItem, BlacklistType, CodeMapNode, MarkedPackage } from "../codeCharta.model"
import ignore from "ignore"

function getAnyCodeMapNodeFromPath(path: string, root: CodeMapNode) {
	const matchingNode = hierarchy(root).find(({ data }) => data.path === path)
	return matchingNode?.data
}

function getCodeMapNodeFromPath(path: string, nodeType: string, root: CodeMapNode) {
	const matchingNode = hierarchy(root).find(({ data }) => data.path === path && data.type === nodeType)
	return matchingNode?.data
}

function getAllPaths(node: CodeMapNode) {
	const paths: string[] = []
	for (const { data } of hierarchy(node)) {
		paths.push(data.path)
	}
	return paths
}

function transformPath(toTransform: string) {
	let removeNumberOfCharactersFromStart = 2

	if (toTransform.startsWith("/")) {
		removeNumberOfCharactersFromStart = 1
	} else if (!toTransform.startsWith("./")) {
		return toTransform
	}

	return toTransform.slice(removeNumberOfCharactersFromStart)
}

function getNodesByGitignorePath(root: CodeMapNode, gitignorePath: string) {
	gitignorePath = gitignorePath.trimStart()
	if (gitignorePath.length === 0) {
		return []
	}

	const ignoredNodePaths = ignore().add(transformPath(gitignorePath))
	const filtered = []
	for (const { data } of hierarchy(root)) {
		if (ignoredNodePaths.ignores(transformPath(data.path))) {
			filtered.push(data)
		}
	}
	return filtered
}

function numberOfBlacklistedNodes(nodes: Array<CodeMapNode>) {
	let count = 0
	for (const node of nodes) {
		if (isBlacklisted(node)) {
			count++
		}
	}
	return count
}

function isPathHiddenOrExcluded(path: string, blacklist: Array<BlacklistItem>) {
	return isPathBlacklisted(path, blacklist, BlacklistType.exclude) || isPathBlacklisted(path, blacklist, BlacklistType.flatten)
}

function isPathBlacklisted(path: string, blacklist: Array<BlacklistItem>, type: BlacklistType) {
	if (blacklist.length === 0) {
		return false
	}
	const ig = ignore()
	for (const entry of blacklist) {
		if (entry.type === type) {
			ig.add(transformPath(entry.path))
		}
	}
	return ig.ignores(transformPath(path))
}

function getMarkingColor(node: CodeMapNode, markedPackages: MarkedPackage[]) {
	if (markedPackages) {
		let longestPathParentPackage: MarkedPackage
		for (const markedPackage of markedPackages) {
			if (
				(!longestPathParentPackage || longestPathParentPackage.path.length < markedPackage.path.length) &&
				node.path.startsWith(markedPackage.path)
			) {
				longestPathParentPackage = markedPackage
			}
		}

		if (longestPathParentPackage) {
			return longestPathParentPackage.color
		}
	}
}

function isBlacklisted(node: CodeMapNode) {
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
