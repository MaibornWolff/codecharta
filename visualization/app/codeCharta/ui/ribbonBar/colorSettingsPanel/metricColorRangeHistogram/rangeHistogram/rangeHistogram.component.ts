import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from "@angular/core"
import * as d3 from "d3"
import { NumberValue } from "d3"
import { parseNumberInput } from "../../../../../util/parseNumberInput"

export type HandleValueChange = (changedValue: { newLeftValue?: number; newRightValue?: number }) => void

@Component({
	selector: "cc-range-histogram",
	templateUrl: "./rangeHistogram.component.html",
	styleUrls: ["./rangeHistogram.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class RangeHistogramComponent implements OnChanges {
	@Input() colorMetric: string
	@Input() minValue: number
	@Input() maxValue: number
	@Input() values: number[]
	@Input() currentLeftValue: number
	@Input() currentRightValue: number
	@Input() leftColor: string
	@Input() middleColor: string
	@Input() rightColor: string
	@Input() handleValueChange: HandleValueChange

	private histogramWidth = 270
	private histogramHeight = 80
	private marginTop = 10
	private marginBottom = 10
	private marginLeft = 46
	private marginRight = 69
	private handleHeight = 2.4

	ngOnChanges(simpleChanges: SimpleChanges) {
		if (
			(simpleChanges.values || simpleChanges.leftColor || simpleChanges.rightColor || simpleChanges.middleColor) &&
			this.values.length > 0
		) {
			this.displayHistogram()
		}
	}

	displayHistogram() {
		d3.select("#cc-range-histogram-container").selectAll("*").remove()

		let previous0
		const percentileData = this.calculatePercentiles(this.values)
		const width = this.histogramWidth - this.marginLeft - this.marginRight
		const height = this.histogramHeight - this.marginTop - this.marginBottom

		const x = d3
			.scaleLinear()
			.domain(d3.extent(percentileData, d => d["x"] as number))
			.range([0, width])
		const y = d3
			.scaleLinear()
			.domain([0, d3.max(percentileData, d => d["y"] as number)])
			.range([height, 0])

		const svg = d3.select("#cc-range-histogram-container").append("svg").attr("width", "100%").attr("height", "130px")
		const g = svg.append("g").attr("transform", `translate(${this.marginLeft}, ${this.marginTop})`)

		g.append("path")
			.attr("d", `M -10 -10 h${width + 33} v${height + 20} h${-width - 33} v${-height - 20}`)
			.attr("fill", "none")
			.attr("stroke", "#888")
			.attr("stroke-width", "1px")

		const pathStartY = -10
		const pathHeight = height + 20
		const verticalCenter = pathStartY + pathHeight / 2

		g.append("text")
			.attr("id", "y-label")
			.attr("class", "y label")
			.attr("transform", `rotate(-90)`)
			.attr("x", -verticalCenter)
			.attr("y", -40)
			.attr("text-anchor", "middle")
			.attr("fill", "#888")
			.text(`${this.colorMetric}`)

		g.append("text")
			.attr("id", "x-label")
			.attr("class", "x label")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", height + this.marginTop + 30)
			.attr("fill", "#888")
			.text(`Quantiles (% of ${this.colorMetric})`)

		g.append("path")
			.datum(percentileData)
			.attr("fill", "none")
			.attr("stroke", this.leftColor)
			.attr("stroke-width", 1)
			.attr(
				"d",
				d3
					.line()
					.curve(d3.curveStepAfter)
					.x(d => x(d["x"]))
					.y(d => y(d["y"]))
			)
			.attr("class", "path-left")

		const sliderLabelL = g
			.append("text")
			.attr("id", "slider-label-left")
			.attr("y", height + 1)

		const sliderLabelR = g
			.append("text")
			.attr("id", "slider-label-right")
			.attr("y", height + 1)

		const brushMove = event => {
			previous0 = event.selection[0]
			const selection = event.selection
			const valueL = Math.round(x.invert(selection[0]))
			const valueR = Math.round(x.invert(selection[1]))
			sliderLabelL.attr("x", selection[0] - 3).text(`${valueL}`)
			sliderLabelR.attr("x", selection[1] + 3).text(`${valueR}`)

			handle.attr("display", null).attr("transform", (d, index) => `translate(${[selection[index], -height / 4]})`)

			svg.node().nodeValue = selection.map(d => Math.round(x.invert(d)))

			const newMetricValueLeft = this.calculateNewMetricValueLeft(percentileData, valueL)
			const newMetricValueRight = this.calculateNewMetricValueRight(percentileData, valueR)

			const coordsLeft = this.calculatePathCoordinates("positive", newMetricValueLeft, newMetricValueRight)
			const coordsMiddle = this.calculatePathCoordinates("neutral", newMetricValueLeft, newMetricValueRight)
			const coordsRight = this.calculatePathCoordinates("negative", newMetricValueLeft, newMetricValueRight)

			g.select(".path-left").remove()
			g.select(".path-middle").remove()
			g.select(".path-right").remove()

			if (coordsLeft) {
				g.append("path")
					.datum(percentileData.filter(d => d["y"] >= coordsLeft["y1"] && d["y"] <= coordsLeft["y2"] + 1))
					.attr("fill", "none")
					.attr("stroke", this.leftColor)
					.attr("stroke-width", 1)
					.attr(
						"d",
						d3
							.line()
							.curve(d3.curveStepAfter)
							.x(d => x(d["x"]))
							.y(d => y(d["y"]))
					)
					.attr("class", "path-left")
			}

			if (coordsMiddle) {
				g.append("path")
					.datum(percentileData.filter(d => d["y"] >= coordsMiddle["y1"] && d["y"] <= coordsMiddle["y2"] + 1))
					.attr("fill", "none")
					.attr("stroke", this.middleColor)
					.attr("stroke-width", 1)
					.attr(
						"d",
						d3
							.line()
							.curve(d3.curveStepAfter)
							.x(d => x(d["x"]))
							.y(d => y(d["y"]))
					)
					.attr("class", "path-middle")
			}

			if (coordsRight) {
				g.append("path")
					.datum(percentileData.filter(d => d["y"] >= coordsRight["y1"] && d["y"] <= coordsRight["y2"]))
					.attr("fill", "none")
					.attr("stroke", this.rightColor)
					.attr("stroke-width", 1)
					.attr(
						"d",
						d3
							.line()
							.curve(d3.curveStepAfter)
							.x(d => x(d["x"]))
							.y(d => y(d["y"]))
					)
					.attr("class", "path-right")
			}

			this.handleValueChange({ newLeftValue: newMetricValueLeft, newRightValue: newMetricValueRight })
		}

		const snapBrushToBucket = function (this, event) {
			svg.style("cursor", "")
			if (!event.sourceEvent) {
				return
			}

			if (!event.selection) {
				if (previous0 === 0) {
					gBrush.call(brush.move, [0, 0])
				} else {
					gBrush.call(brush.move, [178, 178])
				}
				return
			}

			const selection = event.selection.map(value => x.invert(value))
			const roundedSelection = selection.map(d => Math.round(d))
			d3.select(this)
				.transition()
				.call(
					event.target.move,
					roundedSelection.map(value => x(value))
				)
		}

		const brush = d3
			.brushX()
			.extent([
				[0, 0],
				[width, this.handleHeight]
			])
			.on("start", () => {
				svg.style("cursor", "ew-resize")
			})
			.on("brush", brushMove)
			.on("end", snapBrushToBucket)

		const gBrush = g.append("g").attr("class", "brush").call(brush)

		gBrush.selectAll(".overlay, .selection").style("pointer-events", "none")

		gBrush.selectAll(".handle--custom").style("pointer-events", "all")

		g.append("g")
			.attr("id", "axis-x")
			.attr("transform", `translate(0,${height + 10})`)
			.call(d3.axisBottom(x).ticks(5))
			.attr("color", "#888")

		g.append("g")
			.attr("id", "axis-y")
			.attr("transform", "translate(-10,0)")
			.call(
				d3
					.axisLeft(y)
					.ticks(5)
					.tickFormat(function (d: NumberValue) {
						return (d as number) >= 10_000
							? `${d3.format(".0f")((d as number) / 1000)}k`
							: (d as number) >= 1000
							? `${d3.format(".1f")((d as number) / 1000)}k`
							: d.toString()
					})
			)
			.attr("color", "#888")

		g.selectAll(".domain").remove()

		const brushResizePath = d => {
			const trianglePath =
				d.type === "w"
					? `M 0,${height + 25} v ${-this.handleHeight} l ${-this.handleHeight},${-this.handleHeight}, l ${
							this.handleHeight
					  },${-this.handleHeight}, v ${-this.handleHeight}`
					: `M 0,${height + 25} v ${-this.handleHeight} l ${this.handleHeight},${-this.handleHeight}, l ${-this
							.handleHeight},${-this.handleHeight}, v ${-this.handleHeight}`

			return `${trianglePath}`
		}

		const handle = gBrush
			.selectAll(".handle--custom")
			.data([{ type: "w" }, { type: "e" }])
			.enter()
			.append("path")
			.attr("class", "handle--custom")
			.attr("stroke", "#888")
			.attr("fill", "none")
			.attr("cursor", "ew-resize")
			.attr("d", brushResizePath)

		gBrush
			.selectAll(".overlay")
			.each(function (d) {
				d["type"] = "selection"
			})
			.on("mousedown touchstart", () => {
				return
			})

		const leftValue = this.calculateInitialValue(this.currentLeftValue)
		const rightValue = this.calculateInitialValue(this.currentRightValue)
		const rangePair = [leftValue, rightValue].map(value => x(value)) as [number, number]
		gBrush.call(brush.move, rangePair)
	}

	calculatePercentiles(data) {
		const sortedData = data.sort((a, b) => a - b)

		const result = sortedData.map((value, index) => ({
			x: (index / (sortedData.length - 1)) * 100,
			y: value
		}))

		return result
	}

	calculateNewMetricValueLeft(histogramData, leftSliderValue) {
		let newMetricValueLeft = null
		for (const histogramDatum of histogramData) {
			if (histogramDatum["x"] <= leftSliderValue) {
				newMetricValueLeft = histogramDatum["y"]
			} else {
				break
			}
		}
		return newMetricValueLeft
	}

	calculateNewMetricValueRight(histogramData, rightSliderValue) {
		let newMetricValueRight = null
		for (const histogramDatum of histogramData) {
			if (histogramDatum["x"] <= rightSliderValue) {
				newMetricValueRight = histogramDatum["y"]
			} else {
				break
			}
		}
		return newMetricValueRight
	}

	calculatePathCoordinates(pathSegment: string, from, to) {
		switch (pathSegment) {
			case "positive": {
				const isFromValueEqualMinValue = this.minValue === from
				const isFromValueEqualMaxValue = this.maxValue === from
				return isFromValueEqualMinValue
					? null
					: isFromValueEqualMaxValue
					? { y1: this.minValue, y2: from }
					: { y1: this.minValue, y2: from - 1 }
			}
			case "neutral": {
				const isFromValueEqualToValue = from === to
				const isToValueEqualMaxValue = to === this.maxValue
				return isFromValueEqualToValue ? null : isToValueEqualMaxValue ? { y1: from, y2: to } : { y1: from, y2: to - 1 }
			}
			case "negative": {
				const isToValueEqualToMaxValue = this.maxValue === to
				return isToValueEqualToMaxValue ? null : { y1: to, y2: this.maxValue }
			}
		}
	}

	calculateInitialValue(value: number) {
		const initialValues = [...this.values]
		if (!initialValues.includes(value)) {
			initialValues.push(value)
		}
		initialValues.sort((a, b) => a - b)

		const rank = this.calculateRank(initialValues, value)
		const percentile = (rank * 100) / (initialValues.length + 1)
		return Math.round(percentile)
	}

	calculateRank(values: number[], value: number) {
		const firstIndex = values.indexOf(value)
		const lastIndex = values.lastIndexOf(value)

		if (firstIndex === -1) {
			return -1
		}

		const rank = (firstIndex + lastIndex) / 2 + 1
		return rank
	}

	handleCurrentLeftInputChanged(event: Event) {
		const newLeftValue = parseNumberInput(event, this.minValue, this.currentRightValue)
		if (newLeftValue !== this.currentLeftValue) {
			this.handleValueChange({ newLeftValue })
		}
	}

	handleCurrentRightInputChanged(event: Event) {
		const newRightValue = parseNumberInput(event, this.currentLeftValue, this.maxValue)
		if (newRightValue !== this.currentRightValue) {
			this.handleValueChange({ newRightValue })
		}
	}
}
