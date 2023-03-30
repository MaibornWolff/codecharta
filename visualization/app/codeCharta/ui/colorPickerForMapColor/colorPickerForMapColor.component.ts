import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"

import { MapColors, State } from "../../codeCharta.model"
import { selectedColorMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { mapColorsSelector } from "../../state/store/appSettings/mapColors/mapColors.selector"
import { colorRangeSelector } from "../../state/store/dynamicSettings/colorRange/colorRange.selector"

@Component({
	selector: "cc-color-picker-for-map-color",
	templateUrl: "./colorPickerForMapColor.component.html",
	encapsulation: ViewEncapsulation.None
})
export class ColorPickerForMapColorComponent {
	@Input() mapColorFor: keyof Omit<MapColors, "labelColorAndAlpha" | "markingColors">

	mapColors$ = this.store.select(mapColorsSelector)
	colorRange$ = this.store.select(colorRangeSelector)
	nodeMetricRange$ = this.store.select(selectedColorMetricDataSelector)

	constructor(private store: Store<State>) {}

	handleColorChange(newHexColor: string) {
		this.store.dispatch(
			setMapColors({
				value: { [this.mapColorFor]: newHexColor }
			})
		)
	}
}
