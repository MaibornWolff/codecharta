import "./rangeSlider.component.scss"
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core"
import { calculateSliderRangePosition, SliderRangePosition } from "./utils/SliderRangePosition"

@Component({
	selector: "cc-range-slider",
	template: require("./rangeSlider.component.html")
})
export class RangeSliderComponent implements OnChanges {
	@Input() minValue: number
	@Input() maxValue: number
	@Input() currentLeftValue: number
	@Input() currentRightValue: number
	@Input() leftColor: string
	@Input() middleColor: string
	@Input() rightColor: string

	sliderWidth = 160
	sliderRangePosition: SliderRangePosition = { leftEnd: 0, rightStart: 0 }

	ngOnChanges(changes: SimpleChanges) {
		if (changes.minValue || changes.maxValue || changes.currentLeftValue || changes.currentRightValue) {
			this.sliderRangePosition = calculateSliderRangePosition({
				minValue: changes.minValue?.currentValue ?? this.minValue,
				maxValue: changes.maxValue?.currentValue ?? this.maxValue,
				currentLeftValue: changes.currentLeftValue?.currentValue ?? this.currentLeftValue,
				currentRightValue: changes.currentRightValue?.currentValue ?? this.currentRightValue,
				sliderWidth: this.sliderWidth
			})
		}
	}
}
