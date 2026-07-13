import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { areaMetricSelector } from "./areaMetric/areaMetric.selector"
import { colorMetricSelector } from "./colorMetric/colorMetric.selector"
import { colorModeSelector } from "./colorMode/colorMode.selector"
import { colorRangeSelector } from "./colorRange/colorRange.selector"
import { edgeMetricSelector } from "./edgeMetric/edgeMetric.selector"
import { heightMetricSelector } from "./heightMetric/heightMetric.selector"
import { mapColorsSelector } from "./mapColors/mapColors.selector"
import { marginSelector } from "./margin/margin.selector"

@Injectable({
    providedIn: "root"
})
export class MapStateReadWindow {
    constructor(private readonly store: Store<CcState>) {}

    readonly areaMetric$ = this.store.select(areaMetricSelector)
    readonly heightMetric$ = this.store.select(heightMetricSelector)
    readonly colorMetric$ = this.store.select(colorMetricSelector)
    readonly edgeMetric$ = this.store.select(edgeMetricSelector)
    readonly colorRange$ = this.store.select(colorRangeSelector)
    readonly colorMode$ = this.store.select(colorModeSelector)
    readonly mapColors$ = this.store.select(mapColorsSelector)
    readonly margin$ = this.store.select(marginSelector)
}
