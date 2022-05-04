import "./rangeSlider.component.scss"
import { Component, ElementRef, ViewChild } from "@angular/core"

@Component({
	selector: "cc-range-slider",
	template: require("./rangeSlider.component.html")
})
export class RangeSliderComponent {
	@ViewChild("sliderContainer") sliderContainer: ElementRef<HTMLDivElement>

	sliderWidth = 160
}
