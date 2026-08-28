import { createSelector } from "@ngrx/store"
import { ExplorerSearchConfig } from "../../../features/sidebarExplorer/facade"
import { viewIndependentTreeSelector } from "../../../lenses/structure/structure.facade"
import { domainStateSearchPatternSelector } from "../../../stores/domainState/domainState.read.facade"
import { setDomainStateSearchPattern } from "../../../stores/domainState/domainState.write.facade"
import { getNodesByGitignorePath } from "../../../util/blacklist/getNodesByGitignorePath"

// Matched against the same view-independent tree the domain explorer renders, so the metrics pipeline's
// blacklist and metric data cannot decide what the domain search finds.
const domainSearchedNodePathsSelector = createSelector(
    viewIndependentTreeSelector,
    domainStateSearchPatternSelector,
    (tree, searchPattern) => new Set(getNodesByGitignorePath(tree, searchPattern).map(node => node.path))
)

export const DOMAIN_EXPLORER_SEARCH: ExplorerSearchConfig = {
    patternSelector: domainStateSearchPatternSelector,
    setPattern: setDomainStateSearchPattern,
    searchedNodePathsSelector: domainSearchedNodePathsSelector
}
