import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { searchedNodePathsSelector } from "../../../renderer/renderModel/renderModel.facade"
import { explorerTreeNodeSelector } from "../selectors/explorerTreeNode.selector"
import { isExcludePatternDisabledSelector } from "../selectors/searchBar/isExcludePatternDisabled.selector"
import { isFlattenPatternDisabledSelector } from "../selectors/searchBar/isFlattenPatternDisabled.selector"
import { isSearchPatternEmptySelector } from "../selectors/searchBar/isSearchPatternEmpty.selector"
import {
    excludeRulesWithCountSelector,
    explorerCountsSelector,
    flattenRulesWithCountSelector
} from "../selectors/sidebarExplorer.selectors"

@Injectable({
    providedIn: "root"
})
export class SidebarExplorerReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly counts$ = this.store.select(explorerCountsSelector)
    readonly rootNode$ = this.store.select(explorerTreeNodeSelector)
    readonly searchedNodePaths$ = this.store.select(searchedNodePathsSelector)
    readonly flattenRulesWithCount$ = this.store.select(flattenRulesWithCountSelector)
    readonly excludeRulesWithCount$ = this.store.select(excludeRulesWithCountSelector)
    readonly isSearchPatternEmpty$ = this.store.select(isSearchPatternEmptySelector)
    readonly isFlattenPatternDisabled$ = this.store.select(isFlattenPatternDisabledSelector)
    readonly isExcludePatternDisabled$ = this.store.select(isExcludePatternDisabledSelector)
}
