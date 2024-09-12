import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"

import { CcState, MapColors } from "../../codeCharta.model"
import { selectedColorMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { mapColorsSelector } from "../../state/store/appSettings/mapColors/mapColors.selector"
import { colorRangeSelector } from "../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { colorMetricSelector } from "../../state/store/dynamicSettings/colorMetric/colorMetric.selector"

@Component({
    selector: "cc-color-picker-for-map-color",
    templateUrl: "./colorPickerForMapColor.component.html"
})
export class ColorPickerForMapColorComponent {
    @Input() mapColorFor: keyof Omit<MapColors, "labelColorAndAlpha" | "markingColors">

    colorMetric$ = this.store.select(colorMetricSelector)
    mapColors$ = this.store.select(mapColorsSelector)
    colorRange$ = this.store.select(colorRangeSelector)
    nodeMetricRange$ = this.store.select(selectedColorMetricDataSelector)

    constructor(private store: Store<CcState>) {}

    handleColorChange(newHexColor: string) {
        this.store.dispatch(
            setMapColors({
                value: { [this.mapColorFor]: newHexColor }
            })
        )
    }
}
