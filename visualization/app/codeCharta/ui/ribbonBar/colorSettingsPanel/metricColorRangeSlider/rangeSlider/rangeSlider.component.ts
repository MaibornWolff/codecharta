import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core"
import { SliderRangePosition, updateLeftThumb, updateRightThumb } from "./utils/SliderRangePosition"
import { parseNumberInput } from "../../../../../util/parseNumberInput"
import * as d3 from "d3"

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
	@Input() values: number[]
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
		// if (!this.currentlySliding) {
		// 	this.sliderRangePosition = calculateSliderRangePosition({
		// 		minValue: this.minValue,
		// 		maxValue: this.maxValue,
		// 		currentLeftValue: this.currentLeftValue,
		// 		currentRightValue: this.currentRightValue,
		// 		sliderWidth: this.sliderWidth
		// 	})
		if (changes.currentLeftValue) {
			this.upcomingLeftValue = this.currentLeftValue
		}
		// 	if (changes.currentRightValue) {
		// 		this.upcomingRightValue = this.currentRightValue
		// 	}
		// }

		const width = 250
		const height = 200
		const marginTop = 10
		const marginRight = 10
		const marginBottom = 20
		const marginLeft = 25

		const bins = d3
			.bin()
			.thresholds(20)
			.value(d => d)(this.values)

		const outerDiv = d3.select(".cc-range-slider-slider")
		outerDiv.html("")
		const svg = outerDiv.append("svg")
		svg.attr("width", `${width}px`).attr("height", `${height}px`).attr("style", "background-color:green")

		const x = d3
			.scaleLinear()
			.domain([this.minValue, this.maxValue])
			.range([marginLeft, width - marginRight])

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(bins, d => d.length)])
			.range([height - marginBottom, marginTop])

		svg.append("g")
			.attr("transform", `translate(0,${height - marginBottom})`)
			.call(d3.axisBottom(x).ticks(5))

		svg.append("g").attr("transform", `translate(${marginLeft},0)`).call(d3.axisLeft(y).ticks(5))

		svg.append("g")
			.selectAll()
			.data(bins)
			.join("rect")
			.attr("x", d => x(d.x0) + 1)
			.attr("width", d => x(d.x1) - x(d.x0) - 1)
			.attr("y", d => y(d.length))
			.attr("height", d => y(0) - y(d.length))
			.attr("fill", d => {
				return d.x0 < 50 ? "orange" : "blue"
			})
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

	handleCurrentLeftInputChanged($event: Event) {
		const newLeftValue = parseNumberInput($event, this.minValue, this.currentRightValue)
		if (newLeftValue !== this.currentLeftValue) {
			this.handleValueChange({ newLeftValue })
		}
	}

	handleCurrentRightInputChanged($event: Event) {
		const newRightValue = parseNumberInput($event, this.currentLeftValue, this.maxValue)
		if (newRightValue !== this.currentRightValue) {
			this.handleValueChange({ newRightValue })
		}
	}
}
