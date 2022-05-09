import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { HandleValueChange } from "./rangeSlider/rangeSlider.component"

@Component({
	selector: "cc-metric-color-range-slider",
	template: require("./metricColorRangeSlider.component.html")
})
export class MetricColorRangeSliderComponent {
	constructor(@Inject(Store) private store: Store) {}

	currentLeftValue = 62
	currentRightValue = 80
	handleValueChange: HandleValueChange = ({ currentLeftValue, currentRightValue }) => {
		this.currentLeftValue = currentLeftValue
		this.currentRightValue = currentRightValue
	}
}
