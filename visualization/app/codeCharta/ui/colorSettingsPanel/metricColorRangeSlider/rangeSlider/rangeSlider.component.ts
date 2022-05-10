import "./rangeSlider.component.scss"
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core"
import { calculateSliderRangePosition, SliderRangePosition, thumbPosition2Value } from "./utils/SliderRangePosition"

export type HandleValueChange = ({ currentLeftValue, currentRightValue }: { currentLeftValue: number; currentRightValue: number }) => void
export type CurrentlySliding = undefined | "leftThumb" | "rightThumb"

export const sliderWidth = 150

@Component({
	selector: "cc-range-slider",
	template: require("./rangeSlider.component.html")
})
export class RangeSliderComponent implements OnChanges {
	@Input() disabled: boolean
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
	thumbRadius = 7

	private currentlySliding: CurrentlySliding = undefined

	ngOnChanges(changes: SimpleChanges) {
		if (!this.currentlySliding) {
			this.sliderRangePosition = calculateSliderRangePosition({
				minValue: changes.minValue?.currentValue ?? this.minValue,
				maxValue: changes.maxValue?.currentValue ?? this.maxValue,
				currentLeftValue: changes.currentLeftValue?.currentValue ?? this.currentLeftValue,
				currentRightValue: changes.currentRightValue?.currentValue ?? this.currentRightValue
			})
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
				document.addEventListener("mousemove", this.handleRightThumbMoved)
				this.resetCurrentlySlidingOnNextMouseUp(this.handleRightThumbMoved)
				break
			}
		}
	}

	resetCurrentlySlidingOnNextMouseUp = (handler: (event: MouseEvent) => void) => {
		const mouseUpHandler = () => {
			this.currentlySliding = undefined
			document.removeEventListener("mouseup", mouseUpHandler)
			document.removeEventListener("mousemove", handler)
		}
		document.addEventListener("mouseup", mouseUpHandler)
	}

	handleLeftThumbMoved = (event: MouseEvent) => {
		const sliderBoundingClientRectX = this.sliderContainer.nativeElement.getBoundingClientRect().x
		let newLeftThumbScreenX = this.leftThumb.nativeElement.getBoundingClientRect().x + event.movementX
		const rightThumbScreenX = this.rightThumb.nativeElement.getBoundingClientRect().x

		if (newLeftThumbScreenX < sliderBoundingClientRectX - this.thumbRadius) {
			newLeftThumbScreenX = sliderBoundingClientRectX - this.thumbRadius
		}
		if (newLeftThumbScreenX > rightThumbScreenX) {
			newLeftThumbScreenX = rightThumbScreenX
		}
		this.sliderRangePosition = {
			leftEnd: newLeftThumbScreenX - sliderBoundingClientRectX + this.thumbRadius,
			rightStart: this.sliderRangePosition.rightStart
		}

		const nextLeftValue = thumbPosition2Value({
			thumbX: this.sliderRangePosition.leftEnd,
			minValue: this.minValue,
			maxValue: this.maxValue
		})
		this.handleValueChange({ currentLeftValue: nextLeftValue, currentRightValue: this.currentRightValue })
	}

	handleRightThumbMoved = (event: MouseEvent) => {
		const sliderBoundingClientRectX = this.sliderContainer.nativeElement.getBoundingClientRect().x
		let newRightThumbScreenX = this.rightThumb.nativeElement.getBoundingClientRect().x + event.movementX
		const leftThumbScreenX = this.leftThumb.nativeElement.getBoundingClientRect().x

		if (newRightThumbScreenX > sliderBoundingClientRectX + sliderWidth - this.thumbRadius) {
			newRightThumbScreenX = sliderBoundingClientRectX + sliderWidth - this.thumbRadius
		}
		if (newRightThumbScreenX < leftThumbScreenX) {
			newRightThumbScreenX = leftThumbScreenX
		}
		this.sliderRangePosition.rightStart = newRightThumbScreenX - sliderBoundingClientRectX + this.thumbRadius
		this.sliderRangePosition = {
			leftEnd: this.sliderRangePosition.leftEnd,
			rightStart: newRightThumbScreenX - sliderBoundingClientRectX + this.thumbRadius
		}

		const nextRightValue = thumbPosition2Value({
			thumbX: this.sliderRangePosition.rightStart,
			minValue: this.minValue,
			maxValue: this.maxValue
		})
		this.handleValueChange({ currentLeftValue: this.currentLeftValue, currentRightValue: nextRightValue })
	}

	handleCurrentLeftInputChanged($event: InputEvent) {
		const newValue = Number.parseInt(($event.target as HTMLInputElement).value)
		if (newValue !== this.currentLeftValue) {
			this.handleValueChange({ currentLeftValue: newValue, currentRightValue: this.currentRightValue })
		}
	}

	handleCurrentRightInputChanged($event: InputEvent) {
		const newValue = Number.parseInt(($event.target as HTMLInputElement).value)
		if (newValue !== this.currentLeftValue) {
			this.handleValueChange({ currentLeftValue: this.currentLeftValue, currentRightValue: newValue })
		}
	}
}
