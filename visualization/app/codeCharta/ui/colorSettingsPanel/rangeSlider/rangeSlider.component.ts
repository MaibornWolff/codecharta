import "./rangeSlider.component.scss"
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core"
import { calculateSliderRangePosition, SliderRangePosition, thumbPosition2Value } from "./utils/SliderRangePosition"
import { CdkDragMove, Point } from "@angular/cdk/drag-drop"

export type HandleValueChange = ({ currentLeftValue, currentRightValue }: { currentLeftValue: number; currentRightValue: number }) => void

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
	@Input() handleValueChange: HandleValueChange

	@ViewChild("rangeSliderContainer") rangeSliderContainer: ElementRef<HTMLDivElement>

	sliderWidth = 160
	sliderRangePosition: SliderRangePosition = { leftEnd: 0, rightStart: 0 }
	freeDragLeftThumbPosition: undefined | Point
	private lastKnownSliderValues = { minValue: -1, maxValue: -1, currentLeftValue: -1, currentRightValue: -1 }

	ngOnChanges(changes: SimpleChanges) {
		const sliderValuesToBeUpdated = {
			minValue: changes.minValue?.currentValue ?? this.minValue,
			maxValue: changes.maxValue?.currentValue ?? this.maxValue,
			currentLeftValue: changes.currentLeftValue?.currentValue ?? this.currentLeftValue,
			currentRightValue: changes.currentRightValue?.currentValue ?? this.currentRightValue
		}

		this.sliderRangePosition = calculateSliderRangePosition({
			minValue: sliderValuesToBeUpdated.minValue,
			maxValue: sliderValuesToBeUpdated.maxValue,
			currentLeftValue: sliderValuesToBeUpdated.currentLeftValue,
			currentRightValue: sliderValuesToBeUpdated.currentRightValue,
			sliderWidth: this.sliderWidth
		})

		if (
			sliderValuesToBeUpdated.minValue !== this.lastKnownSliderValues.minValue ||
			sliderValuesToBeUpdated.maxValue !== this.lastKnownSliderValues.maxValue ||
			sliderValuesToBeUpdated.currentLeftValue !== this.lastKnownSliderValues.currentLeftValue ||
			sliderValuesToBeUpdated.currentRightValue !== this.lastKnownSliderValues.currentRightValue
		) {
			this.lastKnownSliderValues = sliderValuesToBeUpdated
			this.freeDragLeftThumbPosition = { x: this.sliderRangePosition.leftEnd, y: 0 }
		}
	}

	handleLeftThumbMoved($event: CdkDragMove) {
		this.freeDragLeftThumbPosition = undefined

		const sliderBoundingClientRect = this.rangeSliderContainer.nativeElement.getBoundingClientRect()

		const currentLeftValue = thumbPosition2Value({
			sliderXStart: sliderBoundingClientRect.x,
			thumbX: $event.pointerPosition.x,
			sliderWidth: this.sliderWidth,
			minValue: this.minValue,
			maxValue: this.maxValue,
			roundFunction: Math.floor
		})
		this.lastKnownSliderValues.currentLeftValue = currentLeftValue
		console.log(currentLeftValue)
		this.handleValueChange({ currentLeftValue, currentRightValue: this.currentRightValue })
	}

	constrainLeftThumbPosition = (point: Point) => {
		const sliderBoundingClientRect = this.rangeSliderContainer.nativeElement.getBoundingClientRect()
		if (sliderBoundingClientRect.x > point.x) {
			return { x: sliderBoundingClientRect.x, y: point.y }
		}

		return point
	}
}
