import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"
import { SortingOption } from "../../model/codeCharta.model"

export interface ExplorerSort {
    readonly option$: Observable<SortingOption>
    readonly ascending$: Observable<boolean>
    setOption(option: SortingOption): void
    toggleAscending(): void
}

export const EXPLORER_SORT = new InjectionToken<ExplorerSort>("EXPLORER_SORT")
