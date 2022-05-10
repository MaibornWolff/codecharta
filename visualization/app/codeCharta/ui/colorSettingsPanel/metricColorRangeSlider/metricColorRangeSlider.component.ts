import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { HandleValueChange } from "./rangeSlider/rangeSlider.component"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import debounce from "lodash.debounce"
import { metricColorRangeSliderColorsSelector } from "./rangeSlider/selectors/metricColorRangeSliderColors.selector"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { metricColorRangeSelector } from "./rangeSlider/selectors/metricColorRange.selector"

// Todo remove RzSlider
// Todo tracking
// Todo bug ticket for old slider
// Todo add todo to #2318 for early return of rangeSliderLabels' ngAfterViewChecked
@Component({
	selector: "cc-metric-color-range-slider",
	template: require("./metricColorRangeSlider.component.html")
})
export class MetricColorRangeSliderComponent {
	colorRange$ = this.store.select(metricColorRangeSelector)
	sliderColors$ = this.store.select(metricColorRangeSliderColorsSelector)
	isDeltaState$ = this.store.select(isDeltaStateSelector)

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
