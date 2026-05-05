import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { explorerTreeNodeSelector } from "../selectors/explorerTreeNode.selector"

@Injectable({
    providedIn: "root"
})
export class ExplorerTreeStore {
    constructor(private readonly store: Store<CcState>) {}

    rootNode$ = this.store.select(explorerTreeNodeSelector)
}
