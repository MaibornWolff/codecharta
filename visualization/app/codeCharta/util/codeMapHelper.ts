import { hierarchy } from "d3-hierarchy"
import { BlacklistItem, BlacklistType, CodeMapNode, MarkedPackage } from "../codeCharta.model"
import ignore from "ignore"
import { FileState } from "../model/files/files"
import { getSelectedFilesSize } from "./fileHelper"

export function transformPath(toTransform: string) {
    let removeNumberOfCharactersFromStart = 2

    if (toTransform.startsWith("/")) {
        removeNumberOfCharactersFromStart = 1
    } else if (!toTransform.startsWith("./")) {
        return toTransform
    }

    return toTransform.slice(removeNumberOfCharactersFromStart)
}

export function getAllNodes(root: CodeMapNode): CodeMapNode[] {
    const filtered = []
    if (root !== undefined) {
        for (const { data } of hierarchy(root)) {
            if (data.type !== "Folder") {
                filtered.push(data)
            }
        }
    }
    return filtered
}

export function isNodeExcludedOrFlattened(node: CodeMapNode, gitignorePath: string): boolean {
    const ignoreResults = returnIgnore(gitignorePath)
    return ignoreResults.ignoredNodePaths.ignores(transformPath(node.path)) === ignoreResults.condition
}

export function returnIgnore(gitignorePath: string) {
    gitignorePath = transformPath(gitignorePath.trimStart())

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
    return { ignoredNodePaths, condition }
}

// Adds the patterns of a positive (non-negated) rule to an existing ignore engine.
// Returns false if the rule is negated (`!`-prefix) so the caller knows it cannot be
// merged into the combined engine and must keep a per-rule engine instead.
// Mirrors the pattern-transformation logic of `returnIgnore`.
export function addRulePatternsToEngine(engine: ReturnType<typeof ignore>, rulePath: string): boolean {
    const path = transformPath(rulePath.trimStart())
    if (path.startsWith("!")) {
        return false
    }
    for (let p of path.split(",")) {
        p = p.trimStart()
        if (!p.startsWith("*") && !p.endsWith("*")) {
            p = p.startsWith('"') && p.endsWith('"') ? p.slice(1, -1) : `*${p}*`
        }
        if (p.length === 0) {
            continue
        }
        engine.add(transformPath(p))
    }
    return true
}

export function isPathHiddenOrExcluded(path: string, blacklist: Array<BlacklistItem>) {
    return isPathBlacklisted(path, blacklist, "exclude") || isPathBlacklisted(path, blacklist, "flatten")
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

export interface BlacklistMatcher {
    isExcluded(path: string): boolean
    isFlattened(path: string): boolean
}

export function createBlacklistMatcher(blacklist: BlacklistItem[]): BlacklistMatcher {
    const flatten = ignore()
    const exclude = ignore()
    for (const entry of blacklist) {
        const transformed = transformPath(entry.path)
        if (entry.type === "flatten") {
            flatten.add(transformed)
        } else {
            exclude.add(transformed)
        }
    }
    return {
        isExcluded: path => exclude.ignores(transformPath(path)),
        isFlattened: path => flatten.ignores(transformPath(path))
    }
}

export function getMarkingColor(node: CodeMapNode, markedPackages: MarkedPackage[]): string | void {
    if (!markedPackages) {
        return
    }

    let longestPathParentPackage: MarkedPackage
    for (const markedPackage of markedPackages) {
        if (
            (!longestPathParentPackage || longestPathParentPackage.path.length < markedPackage.path.length) &&
            (node.path.startsWith(`${markedPackage.path}/`) || node.path === markedPackage.path)
        ) {
            longestPathParentPackage = markedPackage
        }
    }

    if (longestPathParentPackage) {
        return longestPathParentPackage.color
    }
}

export type MaybeLeaf = { children?: unknown[] }

export function isLeaf(node: MaybeLeaf) {
    return node.children === undefined || node.children.length === 0
}

export function isAreaValid(node: CodeMapNode, areaMetric: string): boolean {
    return node.deltas?.[areaMetric] < 0 || node.attributes?.[areaMetric] > 0
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
