import { Component, ViewEncapsulation } from "@angular/core"
import { HandleValueChange } from "./rangeHistogram/rangeHistogram.component"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { metricColorRangeHistogramColorsSelector } from "./selectors/metricColorRangeHistogramColors.selector"
import { metricColorRangeHistogramValuesSelector } from "./selectors/metricColorRangeHistogramValues.selector"
import { ColorRange, CcState } from "../../../../codeCharta.model"
import { debounce } from "../../../../util/debounce"
import { Store } from "@ngrx/store"
import { colorMetricSelector } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"

@Component({
	selector: "cc-metric-color-range-slider",
	templateUrl: "./metricColorRangeHistogram.component.html",
	encapsulation: ViewEncapsulation.None
})
export class MetricColorRangeHistogramComponent {
	sliderValues$ = this.store.select(metricColorRangeHistogramValuesSelector)
	sliderColors$ = this.store.select(metricColorRangeHistogramColorsSelector)
	colorMetric$ = this.store.select(colorMetricSelector)

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
