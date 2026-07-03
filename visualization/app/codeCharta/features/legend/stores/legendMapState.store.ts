import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import {
    areaMetricSelector,
    heightMetricSelector,
    colorMetricSelector,
    edgeMetricSelector,
    colorRangeSelector,
    mapColorsSelector
} from "../../../mapState/mapState.read.facade"
import { metricRangeSelector } from "../../../state/selectors/nodeMetricData/nodeMetricData.selector"

// The legend's read-only window onto the mapState home (plus the color-metric value range from the
// state read-model). The only legend code allowed to inject @ngrx Store
// (feature-only-stores-can-import-ngrx-store); every view/appearance read the legend renders flows
// through here, so the service and components stay ngrx-free.
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
    // Color-metric value range (min/max) the legend renders — read straight from the state read-model
    // (metricRangeSelector); the metrics lens no longer re-exposes it (Slice 12c).
    selectedColorMetricData$ = this.store.select(metricRangeSelector)
}
