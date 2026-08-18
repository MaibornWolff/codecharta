import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"

export interface ExplorerSearch {
    readonly pattern$: Observable<string>
    readonly isPatternEmpty$: Observable<boolean>
    readonly searchedNodePaths$: Observable<ReadonlySet<string>>
    setPattern(value: string): void
    resetPattern(): void
}

export const EXPLORER_SEARCH = new InjectionToken<ExplorerSearch>("EXPLORER_SEARCH")
