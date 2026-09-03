import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"
import { SortingOption } from "../../model/codeCharta.model"

/** What the sort control needs, whatever the active mode sorts. */
export interface ExplorerSort<TOption extends string = string> {
    readonly options: readonly TOption[]
    readonly option$: Observable<TOption>
    readonly ascending$: Observable<boolean>
    setOption(option: TOption): void
    toggleAscending(): void
}

export const EXPLORER_SORT = new InjectionToken<ExplorerSort<SortingOption>>("EXPLORER_SORT")

/** Provided only by a view that sorts something other than files. */
export const EXPLORER_WORD_SORT = new InjectionToken<ExplorerSort>("EXPLORER_WORD_SORT")
