import "./rangeSlider.component.scss"
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core"
import { calculateSliderRangePosition, SliderRangePosition, thumbPosition2Value } from "./utils/SliderRangePosition"
import { CdkDragMove, DragRef, Point } from "@angular/cdk/drag-drop"

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

	@ViewChild("rangeSliderContainer") rangeSliderContainer: ElementRef<HTMLDivElement>

	sliderWidth = 160
	sliderRangePosition: SliderRangePosition = { leftEnd: 0, rightStart: 0 }
	freeDragLeftThumbPosition: undefined | Point

	ngOnChanges(changes: SimpleChanges) {
		if (changes.minValue || changes.maxValue || changes.currentLeftValue || changes.currentRightValue) {
			this.sliderRangePosition = calculateSliderRangePosition({
				minValue: changes.minValue?.currentValue ?? this.minValue,
				maxValue: changes.maxValue?.currentValue ?? this.maxValue,
				currentLeftValue: changes.currentLeftValue?.currentValue ?? this.currentLeftValue,
				currentRightValue: changes.currentRightValue?.currentValue ?? this.currentRightValue,
				sliderWidth: this.sliderWidth
			})
			this.freeDragLeftThumbPosition = { x: this.sliderRangePosition.leftEnd, y: 0 }
		}
	}

	handleLeftThumbMoved($event: CdkDragMove) {
		this.freeDragLeftThumbPosition = undefined

		const sliderBoundingClientRect = this.rangeSliderContainer.nativeElement.getBoundingClientRect()

		const newMinValue = thumbPosition2Value({
			sliderXStart: sliderBoundingClientRect.x,
			thumbX: $event.pointerPosition.x,
			sliderWidth: this.sliderWidth,
			minValue: this.minValue,
			maxValue: this.maxValue,
			roundFunction: Math.floor
		})
		console.log(newMinValue)
	}

	constrainLeftThumbPosition = (point: Point, dragReference: DragRef) => {
		const sliderBoundingClientRect = this.rangeSliderContainer.nativeElement.getBoundingClientRect()
		if (sliderBoundingClientRect.x > point.x) {
			return { x: sliderBoundingClientRect.x, y: point.y }
		}

		return point
	}
}
