import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"

@Injectable({
    providedIn: "root"
})
export class SelectedNodeStore {
    constructor(private readonly store: Store<CcState>) {}

    selectedNode$ = this.store.select(selectedNodeSelector)
}
