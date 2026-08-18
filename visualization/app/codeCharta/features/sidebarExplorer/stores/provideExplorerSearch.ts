import { inject, Provider } from "@angular/core"
import { Action, createSelector, MemoizedSelector, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { createSearchedNodePathsSelector } from "../../../renderer/renderModel/renderModel.facade"
import { EXPLORER_SEARCH, ExplorerSearch } from "../explorerSearch.port"
import { _isSearchPatternEmpty } from "../selectors/searchBar/isSearchPatternEmpty.selector"

export interface ExplorerSearchConfig {
    patternSelector: MemoizedSelector<CcState, string>
    setPattern: (props: { value: string }) => Action
    // A view whose pattern also drives other features passes their selectors, so the matching is memoized once for both.
    isPatternEmptySelector?: (state: CcState) => boolean
    searchedNodePathsSelector?: (state: CcState) => ReadonlySet<string>
}

const createExplorerSearch = (store: Store<CcState>, config: ExplorerSearchConfig): ExplorerSearch => {
    const isPatternEmptySelector = config.isPatternEmptySelector ?? createSelector(config.patternSelector, _isSearchPatternEmpty)
    const searchedNodePathsSelector = config.searchedNodePathsSelector ?? createSearchedNodePathsSelector(config.patternSelector)
    return {
        pattern$: store.select(config.patternSelector),
        isPatternEmpty$: store.select(isPatternEmptySelector),
        searchedNodePaths$: store.select(searchedNodePathsSelector),
        setPattern: value => store.dispatch(config.setPattern({ value })),
        resetPattern: () => store.dispatch(config.setPattern({ value: "" }))
    }
}

export const provideExplorerSearch = (config: ExplorerSearchConfig): Provider => ({
    provide: EXPLORER_SEARCH,
    useFactory: () => createExplorerSearch(inject(Store), config)
})
