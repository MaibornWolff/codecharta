import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { explorerCountsSelector } from "../selectors/sidebarExplorer.selectors"

@Injectable({
    providedIn: "root"
})
export class ExplorerCountsStore {
    constructor(private readonly store: Store<CcState>) {}

    counts$ = this.store.select(explorerCountsSelector)
}
