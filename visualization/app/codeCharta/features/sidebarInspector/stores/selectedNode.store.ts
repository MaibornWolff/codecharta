import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { selectedNodeSelector } from "../../../renderModel/renderModel.facade"

@Injectable({
    providedIn: "root"
})
export class InspectorSelectedNodeStore {
    constructor(private readonly store: Store<CcState>) {}

    selectedNode$ = this.store.select(selectedNodeSelector)
}
