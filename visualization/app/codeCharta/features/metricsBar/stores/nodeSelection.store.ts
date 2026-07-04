import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { accumulatedDataSelector } from "../../../renderModel/accumulatedData/accumulatedData.selector"
import { hoveredNodeSelector } from "../../../renderModel/hoveredNode.selector"
import { selectedNodeSelector } from "../../../renderModel/selectedNode.selector"
import { areaMetricSelector, heightMetricSelector } from "../../../mapState/mapState.read.facade"

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
