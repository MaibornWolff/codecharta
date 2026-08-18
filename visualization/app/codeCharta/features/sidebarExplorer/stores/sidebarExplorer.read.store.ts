import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, SortingOption } from "../../../model/codeCharta.model"
import { createExplorerTreeNodeSelector } from "../selectors/explorerTreeNode.selector"
import { isExcludePatternDisabledSelector } from "../selectors/searchBar/isExcludePatternDisabled.selector"
import { isFlattenPatternDisabledSelector } from "../selectors/searchBar/isFlattenPatternDisabled.selector"
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
    readonly flattenRulesWithCount$ = this.store.select(flattenRulesWithCountSelector)
    readonly excludeRulesWithCount$ = this.store.select(excludeRulesWithCountSelector)
    readonly isFlattenPatternDisabled$ = this.store.select(isFlattenPatternDisabledSelector)
    readonly isExcludePatternDisabled$ = this.store.select(isExcludePatternDisabledSelector)

    rootNodeFor(sortingOrder: SortingOption, sortingOrderAscending: boolean) {
        return this.store.select(createExplorerTreeNodeSelector(sortingOrder, sortingOrderAscending))
    }
}
