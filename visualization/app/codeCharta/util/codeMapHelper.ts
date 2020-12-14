import { hierarchy, HierarchyNode } from "d3-hierarchy"
import { BlacklistItem, BlacklistType, CodeMapNode, MarkedPackage } from "../codeCharta.model"
import ignore from "ignore"
import { FileState } from "../model/files/files"
import { getSelectedFilesSize } from "./fileHelper"

export function getAnyCodeMapNodeFromPath(path: string, root: CodeMapNode) {
	const matchingNode = hierarchy(root).find(({ data }) => data.path === path)
	return matchingNode?.data
}

export function getCodeMapNodeFromPath(path: string, nodeType: string, root: CodeMapNode) {
	const matchingNode = hierarchy(root).find(({ data }) => data.path === path && data.type === nodeType)
	return matchingNode?.data
}

export function transformPath(toTransform: string) {
	let removeNumberOfCharactersFromStart = 2

	if (toTransform.startsWith("/")) {
		removeNumberOfCharactersFromStart = 1
	} else if (!toTransform.startsWith("./")) {
		return toTransform
	}

	return toTransform.slice(removeNumberOfCharactersFromStart)
}

export function getNodesByGitignorePath(root: CodeMapNode, gitignorePath: string) {
	gitignorePath = gitignorePath.trimStart()
	if (gitignorePath.length === 0) {
		return []
	}

	let condition = true
	if (gitignorePath.startsWith("!")) {
		gitignorePath = gitignorePath.slice(1)
		condition = false
	}

	const ignoredNodePaths = ignore()

	for (let path of gitignorePath.split(",")) {
		path = path.trimStart()
		if (!path.startsWith("*") && !path.endsWith("*")) {
			path = path.startsWith('"') && path.endsWith('"') ? path.slice(1, -1) : `*${path}*`
		}
		if (path.length === 0) {
			continue
		}
		ignoredNodePaths.add(transformPath(path))
	}

	const filtered = []
	for (const { data } of hierarchy(root)) {
		if (ignoredNodePaths.ignores(transformPath(data.path)) === condition) {
			filtered.push(data)
		}
	}
	return filtered
}

export function numberOfBlacklistedNodes(nodes: Array<CodeMapNode>) {
	let count = 0
	for (const node of nodes) {
		if (isBlacklisted(node)) {
			count++
		}
	}
	return count
}

export function isPathHiddenOrExcluded(path: string, blacklist: Array<BlacklistItem>) {
	return isPathBlacklisted(path, blacklist, BlacklistType.exclude) || isPathBlacklisted(path, blacklist, BlacklistType.flatten)
}

export function isPathBlacklisted(path: string, blacklist: Array<BlacklistItem>, type: BlacklistType) {
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

export function getMarkingColor(node: CodeMapNode, markedPackages: MarkedPackage[]) {
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

export function isBlacklisted(node: CodeMapNode) {
	return node.isExcluded || node.isFlattened
}

export function isLeaf(node: CodeMapNode | HierarchyNode<unknown>) {
	return node.children === undefined || node.children.length === 0
}

export enum MAP_RESOLUTION_SCALE {
	SMALL_MAP = 1,
	MEDIUM_MAP = 0.5,
	BIG_MAP = 0.25
}

export function getMapResolutionScaleFactor(files: FileState[]) {
	const oneMB = 1024 * 1024
	const totalFilesSizeKB = getSelectedFilesSize(files)

	switch (true) {
		case totalFilesSizeKB >= 7 * oneMB:
			return MAP_RESOLUTION_SCALE.BIG_MAP
		case totalFilesSizeKB >= 2 * oneMB:
			return MAP_RESOLUTION_SCALE.MEDIUM_MAP
		default:
			return MAP_RESOLUTION_SCALE.SMALL_MAP
	}
}
