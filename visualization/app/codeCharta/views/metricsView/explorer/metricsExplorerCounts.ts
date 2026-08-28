import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { ExplorerCountsSource } from "../../../features/sidebarExplorer/facade"
import { CcState } from "../../../model/codeCharta.model"
import { explorerCountsSelector } from "./explorerCounts.selector"

@Injectable()
export class MetricsExplorerCounts implements ExplorerCountsSource {
    private readonly store = inject<Store<CcState>>(Store)

    readonly counts$ = this.store.select(explorerCountsSelector)
}
