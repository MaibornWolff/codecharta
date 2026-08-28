import { inject, Provider } from "@angular/core"
import { Action, createSelector, MemoizedSelector, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { EXPLORER_SEARCH, ExplorerSearch } from "../explorerSearch.port"
import { isSearchPatternEmpty } from "../selectors/isSearchPatternEmpty"

export interface ExplorerSearchConfig {
    patternSelector: MemoizedSelector<CcState, string>
    setPattern: (props: { value: string }) => Action
    // Every view states which tree its pattern matches against, so no view inherits another view's node set.
    searchedNodePathsSelector: (state: CcState) => ReadonlySet<string>
    // A view whose pattern also drives other features passes their selector, so the emptiness check is memoized once for both.
    isPatternEmptySelector?: (state: CcState) => boolean
}

const createExplorerSearch = (store: Store<CcState>, config: ExplorerSearchConfig): ExplorerSearch => {
    const isPatternEmptySelector = config.isPatternEmptySelector ?? createSelector(config.patternSelector, isSearchPatternEmpty)
    return {
        pattern$: store.select(config.patternSelector),
        isPatternEmpty$: store.select(isPatternEmptySelector),
        searchedNodePaths$: store.select(config.searchedNodePathsSelector),
        setPattern: value => store.dispatch(config.setPattern({ value })),
        resetPattern: () => store.dispatch(config.setPattern({ value: "" }))
    }
}

export const provideExplorerSearch = (config: ExplorerSearchConfig): Provider => ({
    provide: EXPLORER_SEARCH,
    useFactory: () => createExplorerSearch(inject(Store), config)
})
