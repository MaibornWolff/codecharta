import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { metricRangeSelector } from "../../../renderer/renderModel/renderModel.facade"
import {
    areaMetricSelector,
    colorMetricSelector,
    colorRangeSelector,
    edgeMetricSelector,
    heightMetricSelector,
    mapColorsSelector
} from "../../../stores/mapState/mapState.read.facade"

@Injectable({
    providedIn: "root"
})
export class LegendMapStateStore {
    constructor(private readonly store: Store<CcState>) {}

    areaMetric$ = this.store.select(areaMetricSelector)
    heightMetric$ = this.store.select(heightMetricSelector)
    colorMetric$ = this.store.select(colorMetricSelector)
    edgeMetric$ = this.store.select(edgeMetricSelector)
    colorRange$ = this.store.select(colorRangeSelector)
    mapColors$ = this.store.select(mapColorsSelector)
    selectedColorMetricData$ = this.store.select(metricRangeSelector)
}
