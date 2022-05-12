import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { HandleValueChange } from "./rangeSlider/rangeSlider.component"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import debounce from "lodash.debounce"
import { metricColorRangeSliderColorsSelector } from "./rangeSlider/selectors/metricColorRangeSliderColors.selector"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { metricColorRangeSelector } from "./rangeSlider/selectors/metricColorRange.selector"
import { trackEventUsageData } from "../../../util/usageDataTracker"
import { State } from "../../../state/angular-redux/state"

// Todo remove RzSlider
// Todo bug ticket for old slider
// Todo update label on slide
// Todo add todo to #2318 for early return of rangeSliderLabels' ngAfterViewChecked
@Component({
	selector: "cc-metric-color-range-slider",
	template: require("./metricColorRangeSlider.component.html")
})
export class MetricColorRangeSliderComponent {
	colorRange$ = this.store.select(metricColorRangeSelector)
	sliderColors$ = this.store.select(metricColorRangeSliderColorsSelector)
	isDeltaState$ = this.store.select(isDeltaStateSelector)

	constructor(@Inject(Store) private store: Store, @Inject(State) private state: State) {}

	handleValueChange: HandleValueChange = debounce(({ newLeftValue, newRightValue }) => {
		if (newLeftValue !== undefined) {
			trackEventUsageData("color-range-from-updated", this.state.getValue().files, {
				colorMetric: this.state.getValue().dynamicSettings.colorMetric,
				fromValue: newLeftValue
			})
			this.store.dispatch(setColorRange({ from: newLeftValue }))
		} else {
			trackEventUsageData("color-range-to-updated", this.state.getValue().files, {
				colorMetric: this.state.getValue().dynamicSettings.colorMetric,
				toValue: newRightValue
			})
			this.store.dispatch(setColorRange({ to: newRightValue }))
		}
	}, 400)
}
