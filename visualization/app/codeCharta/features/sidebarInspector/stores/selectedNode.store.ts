import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { selectedBuildingIdSelector } from "../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.selector"

@Injectable({
    providedIn: "root"
})
export class InspectorSelectedNodeStore {
    constructor(private readonly store: Store<CcState>) {}

    selectedNode$ = this.store.select(selectedNodeSelector)
    selectedBuildingId$ = this.store.select(selectedBuildingIdSelector)
}
