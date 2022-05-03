import "./rangeSlider.component.scss"
import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core"

@Component({
	selector: "cc-range-slider",
	template: require("./rangeSlider.component.html")
})
export class RangeSliderComponent implements AfterViewInit {
	@ViewChild("sliderContainer") sliderContainer: ElementRef<HTMLDivElement>

	sliderWidth: undefined | number

	ngAfterViewInit(): void {
		const initialWidthObserver = new ResizeObserver(entries => {
			this.sliderWidth = entries[0].contentBoxSize[0].inlineSize
			initialWidthObserver.disconnect()
		})
		initialWidthObserver.observe(this.sliderContainer.nativeElement)
	}
}
