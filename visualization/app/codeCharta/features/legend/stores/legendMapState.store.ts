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
} from "../../../mapState/mapState.facade"

// The legend's read-only window onto the mapState home. The only legend code allowed to inject
// @ngrx Store (feature-only-stores-can-import-ngrx-store); every view/appearance read the legend
// renders flows through here, so the service and components stay ngrx-free.
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
}
