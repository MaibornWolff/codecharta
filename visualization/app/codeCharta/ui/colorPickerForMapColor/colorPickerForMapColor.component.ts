import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"

import { CcState, HexMapColor } from "../../codeCharta.model"
import { selectedColorMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { mapColorsSelector } from "../../state/store/appSettings/mapColors/mapColors.selector"
import { colorRangeSelector } from "../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { colorMetricSelector } from "../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { LabelledColorPickerComponent } from "../labelledColorPicker/labelledColorPicker.component"
import { AsyncPipe } from "@angular/common"
import { MapColorLabelPipe } from "../../util/pipes/mapColorLabel.pipe"

@Component({
    selector: "cc-color-picker-for-map-color",
    templateUrl: "./colorPickerForMapColor.component.html",
    imports: [LabelledColorPickerComponent, AsyncPipe, MapColorLabelPipe]
})
export class ColorPickerForMapColorComponent {
    @Input() mapColorFor: HexMapColor

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
