import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"

export interface ExplorerCounts {
    shown: number
    flattened: number
    hidden: number
    noArea: number
}

export interface ExplorerCountsSource {
    readonly counts$: Observable<ExplorerCounts>
}

export const EXPLORER_COUNTS = new InjectionToken<ExplorerCountsSource>("EXPLORER_COUNTS")
