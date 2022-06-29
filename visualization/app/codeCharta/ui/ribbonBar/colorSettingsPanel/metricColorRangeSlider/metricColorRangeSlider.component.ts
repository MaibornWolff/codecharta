import { Component, Inject } from "@angular/core"
import { Store } from "../../../../state/angular-redux/store"
import { HandleValueChange } from "./rangeSlider/rangeSlider.component"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import debounce from "lodash.debounce"
import { metricColorRangeSliderColorsSelector } from "./selectors/metricColorRangeSliderColors.selector"
import { metricColorRangeSliderValuesSelector } from "./selectors/metricColorRangeSliderValues.selector"
import { trackEventUsageData } from "../../../../util/usageDataTracker"
import { State } from "../../../../state/angular-redux/state"
import { ColorRange } from "../../../../codeCharta.model"

@Component({
	selector: "cc-metric-color-range-slider",
	template: require("./metricColorRangeSlider.component.html")
})
export class MetricColorRangeSliderComponent {
	sliderValues$ = this.store.select(metricColorRangeSliderValuesSelector)
	sliderColors$ = this.store.select(metricColorRangeSliderColorsSelector)

	private newLeftValue: null | number = null
	private newRightValue: null | number = null

	constructor(@Inject(Store) private store: Store, @Inject(State) private state: State) {}

	handleValueChange: HandleValueChange = ({ newLeftValue, newRightValue }) => {
		if (newLeftValue !== undefined) {
			this.newLeftValue = newLeftValue
		}
		if (newRightValue !== undefined) {
			this.newRightValue = newRightValue
		}
		this.updateColorRangeDebounced()
	}

	private updateColorRangeDebounced = debounce(() => {
		const newColorRange: Partial<ColorRange> = {}
		if (this.newLeftValue !== null) {
			newColorRange.from = this.newLeftValue
			trackEventUsageData("color-range-from-updated", this.state.getValue().files, {
				colorMetric: this.state.getValue().dynamicSettings.colorMetric,
				fromValue: newColorRange.from
			})
		}
		if (this.newRightValue !== null) {
			newColorRange.to = this.newRightValue
			trackEventUsageData("color-range-to-updated", this.state.getValue().files, {
				colorMetric: this.state.getValue().dynamicSettings.colorMetric,
				toValue: newColorRange.to
			})
		}
		this.store.dispatch(setColorRange(newColorRange))

		this.newLeftValue = null
		this.newRightValue = null
	}, 400)
}
