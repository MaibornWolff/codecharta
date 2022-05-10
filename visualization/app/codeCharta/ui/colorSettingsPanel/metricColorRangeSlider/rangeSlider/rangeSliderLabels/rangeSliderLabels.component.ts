import "./rangeSliderLabels.component.scss"
import { AfterViewChecked, Component, ElementRef, Input, OnChanges, ViewChild } from "@angular/core"
import { SliderRangePosition } from "../utils/SliderRangePosition"
import { sliderWidth } from "../rangeSlider.component"

const minDistanceBetweenLabels = 4

@Component({
	selector: "cc-range-slider-labels",
	template: require("./rangeSliderLabels.component.html")
})
export class RangeSliderLabelsComponent implements OnChanges, AfterViewChecked {
	@Input() minValue: number
	@Input() maxValue: number
	@Input() currentLeftValue: number
	@Input() currentRightValue: number
	@Input() sliderRangePosition: SliderRangePosition

	@ViewChild("minLabel") minLabel: ElementRef<HTMLDivElement>
	@ViewChild("maxLabel") maxLabel: ElementRef<HTMLDivElement>
	@ViewChild("currentLeftLabel") currentLeftLabel: ElementRef<HTMLDivElement>
	@ViewChild("currentRightLabel") currentRightLabel: ElementRef<HTMLDivElement>
	@ViewChild("combinedCurrentLeftRightLabel") combinedCurrentLeftRightLabel: ElementRef<HTMLDivElement>

	hideMinLabel = false
	hideMaxLabel = false
	doLeftRightLabelOverlap = false
	currentLeftLabelLeftPosition: number
	currentRightLabelLeftPosition: number
	combinedCurrentLeftRightLabelLeftPosition: number

	private hasUnhandledChanges = false

	ngOnChanges(): void {
		this.hasUnhandledChanges = true
	}

	ngAfterViewChecked(): void {
		if (this.hasUnhandledChanges) {
			this.updateLabelDisplays()
		}
	}

	private updateLabelDisplays() {
		const minLabelRightPosition = this.minLabel.nativeElement.getBoundingClientRect().width
		const currentLeftLabelWidth = this.currentLeftLabel.nativeElement.getBoundingClientRect().width
		this.currentLeftLabelLeftPosition = this.sliderRangePosition.leftEnd - currentLeftLabelWidth / 2

		const currentRightLabelWidth = this.currentRightLabel.nativeElement.getBoundingClientRect().width
		const maxLabelLeftPosition = sliderWidth - this.maxLabel.nativeElement.getBoundingClientRect().width
		this.currentRightLabelLeftPosition = this.sliderRangePosition.rightStart - currentRightLabelWidth / 2

		this.hideMinLabel = this.currentLeftLabelLeftPosition <= minLabelRightPosition + minDistanceBetweenLabels
		this.hideMaxLabel = this.currentRightLabelLeftPosition + currentRightLabelWidth + minDistanceBetweenLabels >= maxLabelLeftPosition

		const currentLeftLabelRightPosition = this.currentLeftLabelLeftPosition + currentLeftLabelWidth
		this.doLeftRightLabelOverlap = currentLeftLabelRightPosition + minDistanceBetweenLabels >= this.currentRightLabelLeftPosition

		const middleBetweenLeftRight = (currentLeftLabelRightPosition + this.currentRightLabelLeftPosition) / 2
		const combinedCurrentLeftRightLabelWidth = this.combinedCurrentLeftRightLabel.nativeElement.getBoundingClientRect().width
		this.combinedCurrentLeftRightLabelLeftPosition = middleBetweenLeftRight - combinedCurrentLeftRightLabelWidth / 2

		this.hasUnhandledChanges = false
	}
}
