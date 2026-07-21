import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"
import { SortingOption } from "../../model/codeCharta.model"

/**
 * How the explorer's tree ordering is stored — per view. The metrics view backs it with the global
 * `preferences.sorting`; the domain view backs it with its own persisted `domainState` sort, so the two
 * views remember their sort independently. The offered options are scoped separately by
 * `EXPLORER_CAPABILITIES.sortOptions`; this port owns the CURRENT option/order and the writes.
 */
export interface ExplorerSort {
    readonly option$: Observable<SortingOption>
    readonly ascending$: Observable<boolean>
    setOption(option: SortingOption): void
    toggleAscending(): void
}

export const EXPLORER_SORT = new InjectionToken<ExplorerSort>("EXPLORER_SORT")
