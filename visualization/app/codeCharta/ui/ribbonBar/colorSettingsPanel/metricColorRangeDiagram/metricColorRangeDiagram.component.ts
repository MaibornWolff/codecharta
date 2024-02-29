import { Component, Input, OnChanges, ViewEncapsulation } from "@angular/core"
import * as d3 from "d3"

type VGElement = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
type GElement = d3.Selection<SVGGElement, unknown, HTMLElement, any>
type Scale = d3.ScaleLinear<number, number>

@Component({
	selector: "cc-metric-color-range-diagram",
	templateUrl: "./metricColorRangeDiagram.component.html",
	styleUrls: ["./metricColorRangeDiagram.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class MetricColorRangeDiagramComponent implements OnChanges {
	@Input() minValue: number
	@Input() maxValue: number
	@Input() colorMetric: string
	@Input() values: number[]
	@Input() currentLeftValue: number
	@Input() currentRightValue: number
	@Input() leftColor: string
	@Input() middleColor: string
	@Input() rightColor: string

	private frameWidth: number
	private frameBuffer: number
	private frameHeight: number
	private diagramWidth: number
	private diagramHeight: number
	private marginTop: number
	private marginBottom: number
	private marginLeft: number
	private marginRight: number
	private yLabelYOffset: number
	private percentileRanks: { x: number; y: number }[]

	ngOnChanges() {
		if (this.values.length > 0) {
			this.percentileRanks = this.calculatePercentileRanks(this.values)
			this.renderDiagram()
		}
	}

	private renderDiagram() {
		this.initializeDiagramDimesions()
		this.clearDiagramContainer()

		const svg = this.createSvg()
		const group = this.createGroup(svg)

		const x = this.createXScale()
		const y = this.createYScale()
		this.drawAxes(group, x, y)
		this.drawFrame(group)
		this.drawLabels(group)
		this.drawAreas(group, x)
		this.drawLine(group)
	}

	private initializeDiagramDimesions() {
		this.frameWidth = 296
		this.frameBuffer = 10
		this.frameHeight = 80
		this.marginTop = 10
		this.marginBottom = 10
		this.marginLeft = 66
		this.marginRight = 54
		this.diagramWidth = this.frameWidth - this.marginLeft - this.marginRight
		this.diagramHeight = this.frameHeight - this.marginTop - this.marginBottom
		this.yLabelYOffset = -47
	}

	private clearDiagramContainer() {
		d3.select("#cc-range-diagram-container").selectAll("*").remove()
	}

	private createSvg() {
		return d3.select("#cc-range-diagram-container").append("svg")
	}

	private createGroup(svg: VGElement) {
		return svg.append("g").attr("transform", `translate(${this.marginLeft}, ${this.marginTop})`)
	}

	private drawFrame(g: GElement) {
		g.append("path")
			.attr(
				"d",
				`M ${-this.frameBuffer} ${-this.frameBuffer} h${this.diagramWidth + 2 * this.frameBuffer} v${
					this.diagramHeight + 2 * this.frameBuffer
				} h${-this.diagramWidth - 2 * this.frameBuffer} v${-this.diagramHeight - 2 * this.frameBuffer}`
			)
			.attr("fill", "none")
			.attr("stroke", "#888")
			.attr("stroke-width", "1px")
	}

	private drawAxes(g: GElement, x: Scale, y: Scale) {
		g.append("g")
			.attr("id", "axis-x")
			.attr("transform", `translate(0,${this.diagramHeight + this.frameBuffer})`)
			.call(d3.axisBottom(x).ticks(5))
			.attr("color", "#888")

		g.append("g")
			.attr("id", "axis-y")
			.attr("transform", `translate(${-this.frameBuffer}, 0)`)
			.call(
				d3
					.axisLeft(y)
					.ticks(5)
					.tickFormat(function (d) {
						return (d as number) >= 10_000
							? `${d3.format(".0f")((d as number) / 1000)}k`
							: (d as number) >= 1000
							? `${d3.format(".1f")((d as number) / 1000)}k`
							: d.toString()
					})
			)
			.attr("color", "#888")
	}

	private createXScale() {
		return d3
			.scaleLinear()
			.domain(d3.extent(this.percentileRanks, d => d["x"] as number))
			.range([0, this.diagramWidth])
	}

	private createYScale() {
		return d3
			.scaleLinear()
			.domain([0, d3.max(this.percentileRanks, d => d["y"] as number)])
			.range([this.diagramHeight, 0])
	}

	private drawLabels(g: GElement) {
		const pathStartY = -this.frameBuffer
		const pathHeight = this.diagramHeight + 2 * this.frameBuffer
		const verticalCenter = pathStartY + pathHeight / 2

		g.append("text")
			.attr("id", "y-label")
			.attr("class", "y label")
			.attr("transform", `rotate(-90)`)
			.attr("x", -verticalCenter)
			.attr("y", this.yLabelYOffset)
			.attr("text-anchor", "middle")
			.attr("fill", "#888")
			.text(`${this.colorMetric}`)

		g.append("text")
			.attr("id", "x-label")
			.attr("class", "x label")
			.attr("text-anchor", "middle")
			.attr("x", this.diagramWidth / 2)
			.attr("y", this.diagramHeight + this.marginTop + this.marginBottom + 2 * this.frameBuffer)
			.attr("fill", "#888")
			.text(`Quantiles (% of ${this.colorMetric})`)
	}

	private drawAreas(g: GElement, x: Scale) {
		const leftValue = x(this.calculatePercentileFromMetricValue(this.currentLeftValue))
		const rightValue = x(this.calculatePercentileFromMetricValue(this.currentRightValue))

		g.append("rect")
			.attr("class", "left-area")
			.attr("x", 0)
			.attr("y", -this.frameBuffer)
			.attr("width", leftValue)
			.attr("height", this.diagramHeight + 2 * this.frameBuffer)
			.style("fill", this.leftColor)
			.style("fill-opacity", "0.3")

		g.append("rect")
			.attr("class", "middle-area")
			.attr("x", leftValue)
			.attr("y", -this.frameBuffer)
			.attr("width", rightValue - leftValue)
			.attr("height", this.diagramHeight + 2 * this.frameBuffer)
			.style("fill", this.middleColor)
			.style("fill-opacity", "0.3")

		g.append("rect")
			.attr("class", "right-area")
			.attr("x", rightValue)
			.attr("y", -this.frameBuffer)
			.attr("width", this.diagramWidth - rightValue)
			.attr("height", this.diagramHeight + 2 * this.frameBuffer)
			.style("fill", this.rightColor)
			.style("fill-opacity", "0.3")
	}

	private drawLine(g: GElement) {
		g.append("path")
			.attr("id", "diagram-path")
			.datum(this.percentileRanks)
			.attr("fill", "none")
			.attr("stroke", "#888")
			.attr("stroke-width", 1)
			.attr(
				"d",
				d3
					.line<{ x: number; y: number }>()
					.curve(d3.curveStepBefore)
					.x(d => this.createXScale()(d["x"]))
					.y(d => this.createYScale()(d["y"]))
			)
	}

	private calculatePercentileRanks(array: number[]) {
		const uniqueSortedNumbers = [...new Set(array)].sort((a, b) => a - b)

		const totalNumbers = array.length
		const percentileRanks = [{ x: 0, y: uniqueSortedNumbers[0] }]

		for (const value of uniqueSortedNumbers) {
			const countLessThanOrEqualToUniqueNumber = array.filter(number_ => number_ <= value).length
			const percentileRank = (countLessThanOrEqualToUniqueNumber / totalNumbers) * 100
			percentileRanks.push({ x: percentileRank, y: value })
		}

		return percentileRanks
	}

	private calculatePercentileFromMetricValue(metricValue: number) {
		if (metricValue === this.minValue) {
			return 0
		}
		if (metricValue === this.maxValue) {
			return 100
		}

		let maxPercentile = null
		for (const percentileRank of this.percentileRanks) {
			if (percentileRank["y"] < metricValue) {
				maxPercentile = percentileRank["x"]
			} else {
				return maxPercentile
			}
		}
	}
}
