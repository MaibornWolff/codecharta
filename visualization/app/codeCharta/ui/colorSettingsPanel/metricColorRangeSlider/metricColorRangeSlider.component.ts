import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { HandleValueChange } from "./rangeSlider/rangeSlider.component"
import { colorRangeSelector } from "../../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import debounce from "lodash.debounce"
import { metricColorRangeSliderColorsSelector } from "./rangeSlider/selectors/metricColorRangeSliderColors.selector"

// Todo disabled?
// Todo remove RzSlider
// todo parseInt
// Todo tracking
// Todo bug ticket for old slider
// Todo add todo to #2318 for early return of rangeSliderLabels' ngAfterViewChecked
@Component({
	selector: "cc-metric-color-range-slider",
	template: require("./metricColorRangeSlider.component.html")
})
export class MetricColorRangeSliderComponent {
	colorRange$ = this.store.select(colorRangeSelector)
	sliderColors$ = this.store.select(metricColorRangeSliderColorsSelector)

	constructor(@Inject(Store) private store: Store) {}

	handleValueChange: HandleValueChange = debounce(({ currentLeftValue, currentRightValue }) => {
		this.store.dispatch(
			setColorRange({
				from: currentLeftValue,
				to: currentRightValue
			})
		)
	}, 400)
}
