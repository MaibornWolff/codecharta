import { Component, ViewEncapsulation } from "@angular/core"
import { HandleValueChange } from "./rangeSlider/rangeSlider.component"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { metricColorRangeSliderColorsSelector } from "./selectors/metricColorRangeSliderColors.selector"
import { metricColorRangeSliderValuesSelector } from "./selectors/metricColorRangeSliderValues.selector"
import { ColorRange, CcState } from "../../../../codeCharta.model"
import { debounce } from "../../../../util/debounce"
import { Store } from "@ngrx/store"

@Component({
	selector: "cc-metric-color-range-slider",
	templateUrl: "./metricColorRangeSlider.component.html",
	encapsulation: ViewEncapsulation.None
})
export class MetricColorRangeSliderComponent {
	sliderValues$ = this.store.select(metricColorRangeSliderValuesSelector)
	sliderColors$ = this.store.select(metricColorRangeSliderColorsSelector)

	private newLeftValue: null | number = null
	private newRightValue: null | number = null

	constructor(private store: Store<CcState>) {}

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
		this.store.dispatch(setColorRange({ value: newColorRange }))

		this.newLeftValue = null
		this.newRightValue = null
	}, 400)
}
