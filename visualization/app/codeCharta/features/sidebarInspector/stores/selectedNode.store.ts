import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { selectedNodeSelector } from "../../../renderer/renderModel/renderModel.facade"

@Injectable({
    providedIn: "root"
})
export class InspectorSelectedNodeStore {
    constructor(private readonly store: Store<CcState>) {}

    selectedNode$ = this.store.select(selectedNodeSelector)
}
