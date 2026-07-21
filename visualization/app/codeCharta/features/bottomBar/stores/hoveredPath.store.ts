import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import {
    createSelectedNodePathPanelDataSelector,
    hoveredNodePathPanelDataSelector,
    selectedNodePathPanelDataSelector
} from "../selectors/hoveredNodePathPanelData.selector"

@Injectable({ providedIn: "root" })
export class HoveredPathStore {
    constructor(private readonly store: Store<CcState>) {}

    hoveredPathData$ = this.store.select(hoveredNodePathPanelDataSelector)
    selectedPathData$ = this.store.select(selectedNodePathPanelDataSelector)

    /** The selected-path panel data resolved from a view-owned path rather than the global selection. */
    selectedPathDataFor(selectedNodePath: string | null) {
        return this.store.select(createSelectedNodePathPanelDataSelector(selectedNodePath))
    }
}
