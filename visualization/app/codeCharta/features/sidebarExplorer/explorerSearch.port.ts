import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"

/** What the search bar needs, whatever the active mode searches. */
export interface ExplorerSearchInput {
    readonly pattern$: Observable<string>
    readonly isPatternEmpty$: Observable<boolean>
    setPattern(value: string): void
    resetPattern(): void
}

export interface ExplorerSearch extends ExplorerSearchInput {
    readonly searchedNodePaths$: Observable<ReadonlySet<string>>
}

export const EXPLORER_SEARCH = new InjectionToken<ExplorerSearch>("EXPLORER_SEARCH")

/** Provided only by a view that browses something other than files. */
export const EXPLORER_WORD_SEARCH = new InjectionToken<ExplorerSearchInput>("EXPLORER_WORD_SEARCH")
