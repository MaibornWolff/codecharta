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

/**
 * The mapState home's injectable READ-WINDOW (Slice 13d) — one shared place that wraps the
 * frequently-read mapState metric/color selectors as observables. Features inject this instead of
 * each re-wrapping the same selector in a per-feature read `*Store`, collapsing the duplicate
 * `store.select(<sameSelector>)` copies into a single window. It is re-exported through
 * `mapState.read.facade`, so consumers reach it via the home's public read surface; it lives under
 * `store/` because it injects `@ngrx/store` (only a home's store/ may — state-home-only-stores-import-ngrx).
 *
 * Value-identical to the per-feature wrappers it replaces: same selectors, same emissions.
 */
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
