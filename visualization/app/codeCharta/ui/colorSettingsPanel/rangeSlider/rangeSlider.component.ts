import "./rangeSlider.component.scss"
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core"
import {
	areSliderValuesEqual,
	calculateSliderRangePosition,
	SliderRangePosition,
	SliderValues,
	thumbPosition2Value
} from "./utils/SliderRangePosition"

export type HandleValueChange = ({ currentLeftValue, currentRightValue }: { currentLeftValue: number; currentRightValue: number }) => void
export type CurrentlySliding = undefined | "leftThumb" | "rightThumb"

export const sliderWidth = 160

// Todo disabled?
// Todo handleValueChange as Partial update?
// Todo remove material cdkDrag again
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

	sliderRangePosition: SliderRangePosition = { leftEnd: 0, rightStart: 0 }
	sliderWidth = sliderWidth

	private currentlySliding: CurrentlySliding = undefined
	private lastKnownSliderValues: SliderValues = { minValue: -1, maxValue: -1, currentLeftValue: -1, currentRightValue: -1 }

	ngOnChanges(changes: SimpleChanges) {
		const sliderValuesToBeUpdated = {
			minValue: changes.minValue?.currentValue ?? this.minValue,
			maxValue: changes.maxValue?.currentValue ?? this.maxValue,
			currentLeftValue: changes.currentLeftValue?.currentValue ?? this.currentLeftValue,
			currentRightValue: changes.currentRightValue?.currentValue ?? this.currentRightValue
		}
		if (!areSliderValuesEqual(this.lastKnownSliderValues, sliderValuesToBeUpdated)) {
			console.log("update slider onChanges")
			this.sliderRangePosition = calculateSliderRangePosition(sliderValuesToBeUpdated)
		}
	}

	setCurrentlySliding(currentlySliding: CurrentlySliding) {
		this.currentlySliding = currentlySliding
		switch (this.currentlySliding) {
			case "leftThumb": {
				document.addEventListener("mousemove", this.handleLeftThumbMoved)
				this.resetCurrentlySlidingOnNextMouseUp(this.handleLeftThumbMoved)
				break
			}
			case "rightThumb": {
				// document.addEventListener("mousemove", this.handleLeftThumbMoved)
				// this.resetCurrentlySlidingOnNextMouseUp()
				break
			}
		}
	}

	resetCurrentlySlidingOnNextMouseUp = (handler: (event: MouseEvent) => void) => {
		const mouseUpHandler = () => {
			this.currentlySliding = undefined
			console.log("hi from mouseup")
			document.removeEventListener("mouseup", mouseUpHandler)
			document.removeEventListener("mousemove", handler)
		}
		document.addEventListener("mouseup", mouseUpHandler)
	}

	handleLeftThumbMoved = (event: MouseEvent) => {
		const sliderBoundingClientRectX = this.sliderContainer.nativeElement.getBoundingClientRect().x
		const newLeftThumbScreenX = this.leftThumb.nativeElement.getBoundingClientRect().x + event.movementX
		const rightThumbScreenX = this.rightThumb.nativeElement.getBoundingClientRect().x

		if (newLeftThumbScreenX < sliderBoundingClientRectX - 8 || newLeftThumbScreenX > rightThumbScreenX) {
			return
		}

		const newLeftEnd = newLeftThumbScreenX - sliderBoundingClientRectX
		const nextLeftValue = thumbPosition2Value({
			thumbXStart: newLeftEnd,
			minValue: this.minValue,
			maxValue: this.maxValue,
			roundFunction: Math.ceil
		})

		this.sliderRangePosition.leftEnd = newLeftEnd
		this.lastKnownSliderValues.currentLeftValue = nextLeftValue

		// this.handleValueChange({ currentLeftValue: nextLeftValue, currentRightValue: this.currentRightValue })
	}

	handleRightThumbMoved = (event: MouseEvent) => {
		// this.freeDragRightThumbPosition = undefined
		// const sliderBoundingClientRect = this.sliderContainer.nativeElement.getBoundingClientRect()
		// const currentRightValue = thumbPosition2Value({
		// 	sliderXStart: sliderBoundingClientRect.x,
		// 	thumbX: $event.source.element.nativeElement.getBoundingClientRect().x,
		// 	minValue: this.minValue,
		// 	maxValue: this.maxValue,
		// 	roundFunction: Math.ceil
		// })
		// this.handleValueChange({ currentRightValue, currentLeftValue: this.currentLeftValue })
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
