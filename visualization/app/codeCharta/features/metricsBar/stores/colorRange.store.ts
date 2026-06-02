import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorRange } from "../../../codeCharta.model"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { colorRangeSelector } from "../../../state/store/dynamicSettings/colorRange/colorRange.selector"
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

    setColorRange(value: Partial<ColorRange>) {
        this.store.dispatch(setColorRange({ value }))
    }
}
