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

export function isPathHiddenOrExcluded(path: string, blacklist: Array<BlacklistItem>, isLeafNode = true) {
    return isPathBlacklisted(path, blacklist, "exclude", isLeafNode) || isPathBlacklisted(path, blacklist, "flatten", isLeafNode)
}

export function isPathBlacklisted(path: string, blacklist: Array<BlacklistItem>, type: BlacklistType, isLeafNode = true) {
    if (blacklist.length === 0) {
        return false
    }
    const matcher = createBlacklistMatcher(blacklist)
    if (type === "flatten") {
        return matcher.isFlattened(path)
    }
    return isLeafNode ? matcher.isExcludedLeaf(path) : matcher.isExcludedSubtree(path)
}

export interface BlacklistMatcher {
    /** A leaf is excluded when a positive exclude rule matches it or a negated (`!`) rule does not match it. */
    isExcludedLeaf(path: string): boolean
    /**
     * Safe whole-subtree check for folders: true only when a positive exclude rule matches the
     * folder itself, which in gitignore semantics also excludes every descendant. Negated rules
     * are deliberately not considered — they apply to leaves only, so a folder that fails to
     * match a negated rule can still contain leaves that match it and must stay visible.
     */
    isExcludedSubtree(path: string): boolean
    /** Flattening applies to any node, leaf or folder. */
    isFlattened(path: string): boolean
    /**
     * Combined flatten+exclude classification with a single path transformation —
     * use this in per-node loops over the whole map (NodeDecorator, explorer counts).
     */
    classify(path: string, isLeafNode: boolean): { isFlattened: boolean; isExcluded: boolean }
}

type IgnoreEngine = ReturnType<typeof ignore>

/**
 * The single matching engine for blacklist rules, shared by NodeDecorator (which writes the
 * `isExcluded`/`isFlattened` flags), the layouts, the metric calculators and the file explorer,
 * so they can never disagree on what a rule affects. Positive rules are merged into one
 * combined engine per type; negated `!`-rules need per-rule engines because they affect every
 * path that does *not* match.
 */
export function createBlacklistMatcher(blacklist: BlacklistItem[]): BlacklistMatcher {
    const flattenCombined = ignore()
    const excludeCombined = ignore()
    let hasPositiveFlatten = false
    let hasPositiveExclude = false
    const negatedFlattenEngines: IgnoreEngine[] = []
    const negatedExcludeEngines: IgnoreEngine[] = []

    for (const item of blacklist) {
        const combined = item.type === "flatten" ? flattenCombined : excludeCombined
        if (addRulePatternsToEngine(combined, item.path)) {
            if (item.type === "flatten") {
                hasPositiveFlatten = true
            } else {
                hasPositiveExclude = true
            }
        } else {
            const engine = returnIgnore(item.path).ignoredNodePaths
            if (item.type === "flatten") {
                negatedFlattenEngines.push(engine)
            } else {
                negatedExcludeEngines.push(engine)
            }
        }
    }

    // plain loops instead of Array.some: these run once per node over the whole map
    const isFlattenedTransformed = (transformedPath: string): boolean => {
        if (hasPositiveFlatten && flattenCombined.ignores(transformedPath)) {
            return true
        }
        for (const engine of negatedFlattenEngines) {
            if (!engine.ignores(transformedPath)) {
                return true
            }
        }
        return false
    }
    const isExcludedLeafTransformed = (transformedPath: string): boolean => {
        if (hasPositiveExclude && excludeCombined.ignores(transformedPath)) {
            return true
        }
        for (const engine of negatedExcludeEngines) {
            if (!engine.ignores(transformedPath)) {
                return true
            }
        }
        return false
    }

    return {
        isExcludedLeaf: path => isExcludedLeafTransformed(transformPath(path)),
        isExcludedSubtree: path => hasPositiveExclude && excludeCombined.ignores(transformPath(path)),
        isFlattened: path => isFlattenedTransformed(transformPath(path)),
        classify: (path, isLeafNode) => {
            const transformedPath = transformPath(path)
            return {
                isFlattened: isFlattenedTransformed(transformedPath),
                isExcluded: isLeafNode && isExcludedLeafTransformed(transformedPath)
            }
        }
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
