import { ExcludedNode } from "../../model/codeCharta.model"
import { buildRuleEngines, transformPath } from "./gitignorePattern"

export interface ExcludeMatcher {
    /** A leaf is excluded when a positive rule matches it or a negated (`!`) rule does not match it. */
    isExcludedLeaf(path: string): boolean
    /**
     * Safe whole-subtree check for folders: true only when a positive rule matches the folder
     * itself, which in gitignore semantics also excludes every descendant. Negated rules are
     * deliberately not considered — they apply to leaves only, so a folder that fails to match a
     * negated rule can still contain leaves that match it and must stay visible.
     */
    isExcludedSubtree(path: string): boolean
}

/**
 * The single engine for exclude rules, shared by the NodeDecorator (which writes `isExcluded`), the
 * layouts, the metric calculators and the file explorer, so they can never disagree on what a rule
 * leaves out of the map.
 */
export function createExcludeMatcher(excludedNodes: ExcludedNode[]): ExcludeMatcher {
    const { combined, hasPositiveRule, matchesTransformed } = buildRuleEngines(excludedNodes)

    return {
        isExcludedLeaf: path => matchesTransformed(transformPath(path)),
        isExcludedSubtree: path => hasPositiveRule && combined.ignores(transformPath(path))
    }
}
