import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { accumulatedDataSelector, hoveredNodeSelector, selectedNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector, heightMetricSelector } from "../../../stores/mapState/mapState.read.facade"

@Injectable({
    providedIn: "root"
})
export class NodeSelectionStore {
    constructor(private readonly store: Store<CcState>) {}

    hoveredNode$ = this.store.select(hoveredNodeSelector)
    selectedNode$ = this.store.select(selectedNodeSelector)
    accumulatedData$ = this.store.select(accumulatedDataSelector)
    areaMetric$ = this.store.select(areaMetricSelector)
    heightMetric$ = this.store.select(heightMetricSelector)
}
