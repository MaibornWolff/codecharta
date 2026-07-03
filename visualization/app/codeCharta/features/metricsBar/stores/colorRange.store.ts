import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorRange } from "../../../codeCharta.model"
import { setColorRange } from "../../../mapState/mapState.write.facade"
import { colorRangeSelector } from "../../../mapState/store/colorRange/colorRange.selector"
import { metricRangeSelector } from "../../../state/selectors/nodeMetricData/nodeMetricData.selector"
import { metricColorRangeColorsSelector } from "../selectors/metricColorRangeColors.selector"
import { metricColorRangeValuesSelector } from "../selectors/metricColorRangeValues.selector"

@Injectable({
    providedIn: "root"
})
export class ColorRangeStore {
    constructor(private readonly store: Store<CcState>) {}

    colorRange$ = this.store.select(colorRangeSelector)

    metricColorRangeColors$ = this.store.select(metricColorRangeColorsSelector)

    metricColorRangeValues$ = this.store.select(metricColorRangeValuesSelector)

    // The color metric's value range (min/max over the visible selection) — the input to
    // calculateInitialColorRange. Read straight from the state read-model selector (metricRangeSelector);
    // the metrics lens no longer re-exposes it (Slice 12c severed the lens's view-aware outputs).
    selectedColorMetricData$ = this.store.select(metricRangeSelector)

    setColorRange(value: Partial<ColorRange>) {
        this.store.dispatch(setColorRange({ value }))
    }
}
