import "./rangeSliderLabels.component.scss"
import { Component, ElementRef, Input, ViewChild } from "@angular/core"
import { SliderRangePosition } from "../utils/SliderRangePosition"

@Component({
	selector: "cc-range-slider-labels",
	template: require("./rangeSliderLabels.component.html")
})
export class RangeSliderLabelsComponent {
	@Input() minValue: number
	@Input() maxValue: number
	@Input() currentLeftValue: number
	@Input() currentRightValue: number
	@Input() sliderRangePosition: SliderRangePosition
	@Input() thumbRadius: number

	@ViewChild("minValueLabel") minValueLabel: ElementRef<HTMLDivElement>
	@ViewChild("maxValueLabel") maxValueLabel: ElementRef<HTMLDivElement>
	@ViewChild("currentLeftValueLabel") currentLeftValueLabel: ElementRef<HTMLDivElement>
	@ViewChild("currentRightValueLabel") currentRightValueLabel: ElementRef<HTMLDivElement>
}
