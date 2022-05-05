import "./rangeSlider.component.scss"
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core"
import {
	areSliderValuesEqual,
	calculateSliderRangePosition,
	SliderRangePosition,
	SliderValues,
	thumbPosition2Value
} from "./utils/SliderRangePosition"
import { CdkDragMove, Point } from "@angular/cdk/drag-drop"

export type HandleValueChange = ({ currentLeftValue, currentRightValue }: { currentLeftValue: number; currentRightValue: number }) => void

// Todo disabled?
// Todo handleValueChange as Partial update?
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

	@ViewChild("rangeSliderContainer") sliderContainer: ElementRef<HTMLDivElement>
	@ViewChild("leftThumb") leftThumb: ElementRef<HTMLDivElement>
	@ViewChild("rightThumb") rightThumb: ElementRef<HTMLDivElement>

	sliderWidth = 160
	sliderRangePosition: SliderRangePosition = { leftEnd: 0, rightStart: 0 }
	freeDragLeftThumbPosition: undefined | Point
	freeDragRightThumbPosition: undefined | Point
	private lastKnownSliderValues: SliderValues = { minValue: -1, maxValue: -1, currentLeftValue: -1, currentRightValue: -1 }

	ngOnChanges(changes: SimpleChanges) {
		const sliderValuesToBeUpdated = {
			minValue: changes.minValue?.currentValue ?? this.minValue,
			maxValue: changes.maxValue?.currentValue ?? this.maxValue,
			currentLeftValue: changes.currentLeftValue?.currentValue ?? this.currentLeftValue,
			currentRightValue: changes.currentRightValue?.currentValue ?? this.currentRightValue
		}

		this.sliderRangePosition = calculateSliderRangePosition({
			...sliderValuesToBeUpdated,
			sliderWidth: this.sliderWidth
		})

		if (!areSliderValuesEqual(sliderValuesToBeUpdated, this.lastKnownSliderValues)) {
			this.lastKnownSliderValues = sliderValuesToBeUpdated
			this.freeDragLeftThumbPosition = { x: this.sliderRangePosition.leftEnd, y: 0 }
			this.freeDragRightThumbPosition = { x: this.sliderRangePosition.rightStart, y: 0 }
		}
	}

	handleLeftThumbMoved($event: CdkDragMove) {
		this.freeDragLeftThumbPosition = undefined

		const sliderBoundingClientRect = this.sliderContainer.nativeElement.getBoundingClientRect()

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
		const sliderBoundingClientRect = this.sliderContainer.nativeElement.getBoundingClientRect()
		if (sliderBoundingClientRect.x > point.x) {
			return { x: sliderBoundingClientRect.x, y: point.y }
		}

		const rightThumbX = this.rightThumb.nativeElement.getBoundingClientRect().x
		if (point.x >= rightThumbX) {
			return { x: rightThumbX, y: point.y }
		}

		return point
	}

	handleRightThumbMoved($event: CdkDragMove) {
		this.freeDragRightThumbPosition = undefined

		const sliderBoundingClientRect = this.sliderContainer.nativeElement.getBoundingClientRect()

		const currentRightValue = thumbPosition2Value({
			sliderXStart: sliderBoundingClientRect.x,
			thumbX: $event.pointerPosition.x,
			sliderWidth: this.sliderWidth,
			minValue: this.minValue,
			maxValue: this.maxValue,
			roundFunction: Math.ceil
		})
		this.lastKnownSliderValues.currentRightValue = currentRightValue
		console.log(currentRightValue)
		this.handleValueChange({ currentRightValue, currentLeftValue: this.currentLeftValue })
	}

	constrainRightThumbPosition = (point: Point) => {
		const sliderBoundingClientRect = this.sliderContainer.nativeElement.getBoundingClientRect()
		const sliderEnd = sliderBoundingClientRect.x + sliderBoundingClientRect.width
		if (sliderEnd < point.x) {
			return { x: sliderEnd, y: point.y }
		}

		const leftThumbX = this.leftThumb.nativeElement.getBoundingClientRect().x
		// todo add half thumb width for left and right
		if (point.x <= leftThumbX) {
			return { x: leftThumbX, y: point.y }
		}

		return point
	}

	handleCurrentLeftInputChanged($event: InputEvent) {
		const newValue = Number.parseInt(($event.target as HTMLInputElement).value)
		const isValid = newValue >= this.minValue && newValue <= this.currentRightValue
		if (newValue !== this.currentLeftValue && isValid) {
			this.handleValueChange({ currentLeftValue: newValue, currentRightValue: this.currentRightValue })
		}
	}

	handleCurrentRightInputChanged($event: InputEvent) {
		const newValue = Number.parseInt(($event.target as HTMLInputElement).value)
		const isValid = newValue <= this.maxValue && newValue >= this.currentLeftValue
		if (newValue !== this.currentLeftValue && isValid) {
			this.handleValueChange({ currentLeftValue: this.currentLeftValue, currentRightValue: newValue })
		}
	}
}
