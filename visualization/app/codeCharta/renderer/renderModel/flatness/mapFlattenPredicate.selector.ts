import { createSelector } from "@ngrx/store"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { searchedNodePathsSelector } from "../searchedNodes/searchedNodePaths.selector"
import { FlattenPredicate, flattenPredicateSelector } from "./flattenPredicate.selector"

/**
 * Whether a radial map draws a node grey: what the flatten rules flatten, and, while searching,
 * whatever does not lead to a hit — so the folders around a hit keep showing where it is.
 */
export const mapFlattenPredicateSelector = createSelector(
    flattenPredicateSelector,
    searchPatternSelector,
    searchedNodePathsSelector,
    (isFlattenedByRule, searchPattern, searchedNodePaths): FlattenPredicate => {
        if (!searchPattern) {
            return isFlattenedByRule
        }
        const pathsLeadingToHits = withAncestorPaths(searchedNodePaths)
        return node => isFlattenedByRule(node) || !pathsLeadingToHits.has(node.path)
    }
)

function withAncestorPaths(paths: ReadonlySet<string>): Set<string> {
    const pathsWithAncestors = new Set<string>()
    for (const path of paths) {
        for (let end = path.indexOf("/", 1); end !== -1; end = path.indexOf("/", end + 1)) {
            pathsWithAncestors.add(path.slice(0, end))
        }
        pathsWithAncestors.add(path)
    }
    return pathsWithAncestors
}
