import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hoveredNodePathPanelDataSelector } from "../selectors/hoveredNodePathPanelData.selector"

@Injectable({ providedIn: "root" })
export class HoveredPathStore {
    constructor(private readonly store: Store<CcState>) {}

    hoveredPathData$ = this.store.select(hoveredNodePathPanelDataSelector)
}
