import { inject, Provider } from "@angular/core"
import { Action, Store } from "@ngrx/store"
import { CcState, SortingOption } from "../../../model/codeCharta.model"
import { EXPLORER_SORT, ExplorerSort } from "../explorerSort.port"

export interface ExplorerSortConfig {
    options: SortingOption[]
    optionSelector: (state: CcState) => SortingOption
    ascendingSelector: (state: CcState) => boolean
    setOption: (props: { value: SortingOption }) => Action
    // Views differ in how they flip the order: some own a toggle action, others set the negated value.
    toggleAscending: (currentAscending: boolean) => Action
}

const createExplorerSort = (store: Store<CcState>, config: ExplorerSortConfig): ExplorerSort<SortingOption> => {
    const ascending = store.selectSignal(config.ascendingSelector)
    return {
        options: config.options,
        option$: store.select(config.optionSelector),
        ascending$: store.select(config.ascendingSelector),
        setOption: option => store.dispatch(config.setOption({ value: option })),
        toggleAscending: () => store.dispatch(config.toggleAscending(ascending()))
    }
}

export const provideExplorerSort = (config: ExplorerSortConfig): Provider => ({
    provide: EXPLORER_SORT,
    useFactory: () => createExplorerSort(inject(Store), config)
})
