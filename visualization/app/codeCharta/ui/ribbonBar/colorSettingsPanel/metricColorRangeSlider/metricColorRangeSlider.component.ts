import { Component, Inject } from "@angular/core"
import { Store } from "../../../../state/angular-redux/store"
import { HandleValueChange } from "./rangeSlider/rangeSlider.component"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import debounce from "lodash.debounce"
import { metricColorRangeSliderColorsSelector } from "./selectors/metricColorRangeSliderColors.selector"
import { metricColorRangeSliderValuesSelector } from "./selectors/metricColorRangeSliderValues.selector"
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

	constructor(@Inject(Store) private store: Store) {}

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
		}
		if (this.newRightValue !== null) {
			newColorRange.to = this.newRightValue
		}
		this.store.dispatch(setColorRange(newColorRange))

		this.newLeftValue = null
		this.newRightValue = null
	}, 400)
}
