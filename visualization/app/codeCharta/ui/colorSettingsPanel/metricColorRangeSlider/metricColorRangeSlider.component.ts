import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { HandleValueChange } from "./rangeSlider/rangeSlider.component"
import { colorRangeSelector } from "../../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"

@Component({
	selector: "cc-metric-color-range-slider",
	template: require("./metricColorRangeSlider.component.html")
})
export class MetricColorRangeSliderComponent {
	colorRange$ = this.store.select(colorRangeSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleValueChange: HandleValueChange = ({ currentLeftValue, currentRightValue }) => {
		// todo add debounce
		this.store.dispatch(
			setColorRange({
				from: currentLeftValue,
				to: currentRightValue
			})
		)
	}
}
