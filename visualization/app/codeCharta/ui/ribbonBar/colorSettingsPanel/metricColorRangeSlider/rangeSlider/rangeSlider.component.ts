import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core"
import { calculateSliderRangePosition, SliderRangePosition, updateLeftThumb, updateRightThumb } from "./utils/SliderRangePosition"
import { parseNumberInput } from "../../../../../util/parseNumberInput"

export type HandleValueChange = (changedValue: { newLeftValue?: number; newRightValue?: number }) => void
export type CurrentlySliding = undefined | "leftThumb" | "rightThumb"

@Component({
	selector: "cc-range-slider",
	templateUrl: "./rangeSlider.component.html",
	styleUrls: ["./rangeSlider.component.scss"],
	encapsulation: ViewEncapsulation.None
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
	@Input() sliderWidth = 150

	@ViewChild("rangeSliderContainer") sliderContainer: ElementRef<HTMLDivElement>
	@ViewChild("leftThumb") leftThumb: ElementRef<HTMLDivElement>
	@ViewChild("rightThumb") rightThumb: ElementRef<HTMLDivElement>

	sliderRangePosition: SliderRangePosition = { leftEnd: 0, rightStart: 0 }
	thumbRadius = 7
	upcomingLeftValue: number
	upcomingRightValue: number

	private currentlySliding: CurrentlySliding = undefined

	ngOnChanges(changes: SimpleChanges) {
		if (!this.currentlySliding) {
			this.sliderRangePosition = calculateSliderRangePosition({
				minValue: this.minValue,
				maxValue: this.maxValue,
				currentLeftValue: this.currentLeftValue,
				currentRightValue: this.currentRightValue,
				sliderWidth: this.sliderWidth
			})
			if (changes.currentLeftValue) {
				this.upcomingLeftValue = this.currentLeftValue
			}
			if (changes.currentRightValue) {
				this.upcomingRightValue = this.currentRightValue
			}
		}
	}

	setCurrentlySliding(currentlySliding: CurrentlySliding) {
		this.currentlySliding = currentlySliding
		switch (this.currentlySliding) {
			case "leftThumb":
				document.addEventListener("mousemove", this.handleLeftThumbMoved)
				this.rightThumb.nativeElement.style.zIndex = "0"
				this.leftThumb.nativeElement.style.zIndex = "1"
				this.resetCurrentlySlidingOnNextMouseUp(this.handleLeftThumbMoved)
				break

			case "rightThumb":
				document.addEventListener("mousemove", this.handleRightThumbMoved)
				this.leftThumb.nativeElement.style.zIndex = "0"
				this.rightThumb.nativeElement.style.zIndex = "1"
				this.resetCurrentlySlidingOnNextMouseUp(this.handleRightThumbMoved)
				break
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
		const updates = updateLeftThumb({
			deltaX: event.movementX,
			thumbScreenX: this.leftThumb.nativeElement.getBoundingClientRect().x,
			thumbRadius: this.thumbRadius,
			otherThumbScreenX: this.rightThumb.nativeElement.getBoundingClientRect().x,
			sliderBoundingClientRectX: this.sliderContainer.nativeElement.getBoundingClientRect().x,
			sliderWidth: this.sliderWidth,
			minValue: this.minValue,
			maxValue: this.maxValue
		})
		this.sliderRangePosition = {
			leftEnd: updates.updatedThumbX,
			rightStart: this.sliderRangePosition.rightStart
		}
		this.upcomingLeftValue = updates.upcomingValue
		this.handleValueChange({ newLeftValue: updates.upcomingValue })
	}

	handleRightThumbMoved = (event: MouseEvent) => {
		const updates = updateRightThumb({
			deltaX: event.movementX,
			thumbScreenX: this.rightThumb.nativeElement.getBoundingClientRect().x,
			thumbRadius: this.thumbRadius,
			otherThumbScreenX: this.leftThumb.nativeElement.getBoundingClientRect().x,
			sliderBoundingClientRectX: this.sliderContainer.nativeElement.getBoundingClientRect().x,
			sliderWidth: this.sliderWidth,
			minValue: this.minValue,
			maxValue: this.maxValue
		})
		this.sliderRangePosition = {
			leftEnd: this.sliderRangePosition.leftEnd,
			rightStart: updates.updatedThumbX
		}
		this.upcomingRightValue = updates.upcomingValue
		this.handleValueChange({ newRightValue: updates.upcomingValue })
	}

	handleCurrentLeftInputChanged($event: InputEvent) {
		const newLeftValue = parseNumberInput($event, this.minValue, this.currentRightValue)
		if (newLeftValue !== this.currentLeftValue) {
			this.handleValueChange({ newLeftValue })
		}
	}

	handleCurrentRightInputChanged($event: InputEvent) {
		const newRightValue = parseNumberInput($event, this.currentLeftValue, this.maxValue)
		if (newRightValue !== this.currentRightValue) {
			this.handleValueChange({ newRightValue })
		}
	}
}
