import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { ExplorerSort } from "../../../features/sidebarExplorer/facade"
import { SortingOption } from "../../../model/codeCharta.model"
import { PreferencesReadWindow } from "../../../stores/preferences/preferences.read.facade"
import { setSortingOption, toggleSortingOrderAscending } from "../../../stores/preferences/preferences.write.facade"

/**
 * The metrics view's explorer sort: the global `preferences.sorting`, unchanged. Reading and writing the
 * same slice as before keeps the map view's sort behavior (and its persistence) byte-identical.
 */
@Injectable()
export class MetricsExplorerSort implements ExplorerSort {
    private readonly store = inject(Store)
    private readonly preferencesReadWindow = inject(PreferencesReadWindow)

    readonly option$ = this.preferencesReadWindow.sortingOrder$
    readonly ascending$ = this.preferencesReadWindow.sortingOrderAscending$

    setOption(option: SortingOption): void {
        this.store.dispatch(setSortingOption({ value: option }))
    }

    toggleAscending(): void {
        this.store.dispatch(toggleSortingOrderAscending())
    }
}
