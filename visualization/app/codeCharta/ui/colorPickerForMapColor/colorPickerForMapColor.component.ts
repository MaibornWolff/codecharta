import { Component, Inject, Input } from "@angular/core"

import { MapColors } from "../../codeCharta.model"
import { Store } from "../../state/angular-redux/store"
import { nodeMetricRangeSelector } from "../../state/selectors/accumulatedData/metricData/nodeMetricRange.selector"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { mapColorsSelector } from "../../state/store/appSettings/mapColors/mapColors.selector"
import { colorRangeSelector } from "../../state/store/dynamicSettings/colorRange/colorRange.selector"

@Component({
	selector: "cc-color-picker-for-map-color",
	template: require("./colorPickerForMapColor.component.html")
})
export class ColorPickerForMapColorComponent {
	@Input() mapColorFor: keyof MapColors

	mapColors$ = this.store.select(mapColorsSelector)
	colorRange$ = this.store.select(colorRangeSelector)
	nodeMetricRange$ = this.store.select(nodeMetricRangeSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleColorChange(newHexColor: string) {
		this.store.dispatch(
			setMapColors({
				[this.mapColorFor]: newHexColor
			})
		)
	}
}
