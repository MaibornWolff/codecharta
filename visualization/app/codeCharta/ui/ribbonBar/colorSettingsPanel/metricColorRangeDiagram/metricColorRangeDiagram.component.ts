import { Component, Input, OnChanges } from "@angular/core"
import * as d3 from "d3"

type SVGElement = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
type GroupElement = d3.Selection<SVGGElement, unknown, HTMLElement, any>
type TextElement = d3.Selection<SVGTextElement, unknown, HTMLElement, any>
type LineElement = d3.Selection<SVGLineElement, unknown, HTMLElement, any>
type RectElement = d3.Selection<SVGRectElement, unknown, HTMLElement, any>
type Scale = d3.ScaleLinear<number, number>

@Component({
    selector: "cc-metric-color-range-diagram",
    templateUrl: "./metricColorRangeDiagram.component.html",
    styleUrls: ["./metricColorRangeDiagram.component.scss"],
    standalone: true
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
    @Input() isAttributeDirectionInverted: boolean

    private svgWidth: number
    private framePadding: number
    private svgHeight: number
    private frameWidth: number
    private frameHeight: number
    private frameMarginTop: number
    private frameMarginBottom: number
    private frameMarginLeft: number
    private frameMarginRight: number
    private yLabelXOffset: number
    private xLabelYOffset: number
    private percentileRanks: { x: number; y: number }[]
    private percentileToMetricValueMap: Map<number, number>

    ngOnChanges() {
        if (this.values.length > 0) {
            this.percentileRanks = this.isAttributeDirectionInverted
                ? this.calculateReversedPercentileRanks(this.values)
                : this.calculatePercentileRanks(this.values)
            this.updatePercentileToMetricValueMap()
            this.renderDiagram()
        }
    }

    private updatePercentileToMetricValueMap() {
        this.percentileToMetricValueMap = new Map()
        let currentPercentileRankIndex = 0
        for (let percentile = 0; percentile <= 100; percentile++) {
            while (
                percentile > this.percentileRanks[currentPercentileRankIndex]["x"] &&
                currentPercentileRankIndex < this.percentileRanks.length - 1
            ) {
                currentPercentileRankIndex++
            }
            this.percentileToMetricValueMap.set(percentile, this.percentileRanks[currentPercentileRankIndex]["y"])
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
        this.addCrossHair(group, x, y)
    }

    private initializeDiagramDimesions() {
        this.svgWidth = 550
        this.svgHeight = 250

        this.frameMarginTop = 10
        this.frameMarginBottom = 50
        this.frameMarginLeft = 50
        this.frameMarginRight = 10
        this.framePadding = 5

        this.frameHeight = this.svgHeight - this.frameMarginTop - this.frameMarginBottom
        this.frameWidth = this.svgWidth - this.frameMarginLeft - this.frameMarginRight

        this.yLabelXOffset = 80
        this.xLabelYOffset = 20
    }

    private clearDiagramContainer() {
        d3.select("#cc-range-diagram-container").selectAll("*").remove()
    }

    private createSvg() {
        return d3.select("#cc-range-diagram-container").append("svg").attr("width", this.svgWidth).attr("height", this.svgHeight)
    }

    private createGroup(svg: SVGElement) {
        return svg
            .append("g")
            .attr("transform", `translate(${this.frameMarginLeft}, ${this.frameMarginTop})`)
            .attr("display", "flex")
            .attr("justify-content", "center")
    }

    private drawFrame(g: GroupElement) {
        g.append("path")
            .attr(
                "d",
                `M 0 0
                h${this.frameWidth}
                v${this.frameHeight}
                h${-this.frameWidth}
                v${-this.frameHeight}`
            )
            .attr("fill", "none")
            .attr("stroke", "#888")
            .attr("stroke-width", "1px")
    }

    private drawAxes(g: GroupElement, x: Scale, y: Scale) {
        g.append("g")
            .attr("id", "axis-x")
            .attr("transform", `translate(${this.framePadding},${this.frameHeight})`)
            .call(d3.axisBottom(x).ticks(5))
            .attr("font-size", "13px")
            .attr("color", "#888")

        g.append("g")
            .attr("id", "axis-y")
            .attr("transform", `translate(0,${this.framePadding})`)
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
            .attr("font-size", "13px")
            .attr("color", "#888")
    }

    private createXScale() {
        return d3
            .scaleLinear()
            .domain(d3.extent(this.percentileRanks, d => d["x"] as number))
            .range([0, this.frameWidth - 2 * this.framePadding])
    }

    private createYScale() {
        const domainStandard = [0, d3.max(this.percentileRanks, d => d["y"] as number)]
        const domainInverted = [d3.max(this.percentileRanks, d => d["y"] as number), 0]

        return d3
            .scaleLinear()
            .domain(this.isAttributeDirectionInverted ? domainInverted : domainStandard)
            .range([this.frameHeight - 2 * this.framePadding, 0])
    }

    private drawLabels(g: GroupElement) {
        g.append("text")
            .attr("id", "y-label")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -this.frameHeight / 2 - this.frameMarginTop)
            .attr("y", this.frameMarginLeft - this.yLabelXOffset)
            .attr("fill", "#888")
            .text(`${this.colorMetric}`)

        g.append("text")
            .attr("id", "x-label")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", this.frameWidth / 2)
            .attr("y", this.frameHeight + this.frameMarginTop + this.xLabelYOffset)
            .attr("fill", "#888")
            .text(`Quantiles (% of ${this.colorMetric})`)
    }

    private drawAreas(g: GroupElement, x: Scale) {
        const leftValue = x(
            this.isAttributeDirectionInverted
                ? this.calculateReversedPercentileFromMetricValue(this.currentRightValue)
                : this.calculatePercentileFromMetricValue(this.currentLeftValue)
        )
        const rightValue = x(
            this.isAttributeDirectionInverted
                ? this.calculateReversedPercentileFromMetricValue(this.currentLeftValue)
                : this.calculatePercentileFromMetricValue(this.currentRightValue)
        )

        g.append("rect")
            .attr("class", "left-area")
            .attr("x", this.framePadding)
            .attr("width", leftValue)
            .attr("height", this.frameHeight)
            .style("fill", this.isAttributeDirectionInverted ? this.rightColor : this.leftColor)
            .style("fill-opacity", "0.3")

        g.append("rect")
            .attr("class", "middle-area")
            .attr("x", leftValue + this.framePadding)
            .attr("width", rightValue - leftValue)
            .attr("height", this.frameHeight)
            .style("fill", this.middleColor)
            .style("fill-opacity", "0.3")

        g.append("rect")
            .attr("class", "right-area")
            .attr("x", rightValue + this.framePadding)
            .attr("width", this.frameWidth - 2 * this.framePadding - rightValue)
            .attr("height", this.frameHeight)
            .style("fill", this.isAttributeDirectionInverted ? this.leftColor : this.rightColor)
            .style("fill-opacity", "0.3")
    }

    private drawLine(g: GroupElement) {
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
            .attr("transform", `translate(${this.framePadding}, ${this.framePadding})`)
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

    private calculateReversedPercentileRanks(array: number[]) {
        const uniqueSortedNumbers = [...new Set(array)].sort((a, b) => a - b).reverse()

        const totalNumbers = array.length
        const percentileRanks = [{ x: 0, y: uniqueSortedNumbers[0] }]

        for (const value of uniqueSortedNumbers) {
            const countGreaterThanOrEqualToUniqueNumber = array.filter(number_ => number_ >= value).length
            const percentileRank = (countGreaterThanOrEqualToUniqueNumber / totalNumbers) * 100
            percentileRanks.push({ x: percentileRank, y: value })
        }

        return percentileRanks.sort((a, b) => a.x - b.x)
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

    private calculateReversedPercentileFromMetricValue(metricValue: number) {
        if (metricValue === this.maxValue) {
            return 0
        }
        if (metricValue === this.minValue) {
            return 100
        }

        let minPercentile = null
        for (const percentileRank of this.percentileRanks) {
            if (percentileRank["y"] > metricValue) {
                minPercentile = percentileRank["x"]
            } else {
                return minPercentile
            }
        }
    }

    private addCrossHair(group: GroupElement, x: Scale, y: Scale) {
        const tooltip: TextElement = group
            .append("text")
            .attr("class", "cross-tooltip")
            .attr("fill", "#000")
            .attr("font-size", "13px")
            .style("display", "none")

        const dashedVerticalLine: LineElement = group
            .append("line")
            .attr("class", "dashed-vertical-line")
            .attr("stroke", "#000")
            .attr("stroke-width", "0.7px")
            .attr("stroke-dasharray", "4")
            .style("display", "none")

        const straightVerticalLine: LineElement = group
            .append("line")
            .attr("class", "straight-vertical-line")
            .attr("stroke", "#000")
            .attr("stroke-width", "0.7px")
            .style("display", "none")

        const horizontalLine: LineElement = group
            .append("line")
            .attr("class", "horizontal-line")
            .attr("stroke", "#000")
            .attr("stroke-width", "0.7px")
            .style("display", "none")

        const rectangle: RectElement = group
            .append("rect")
            .attr("class", "mouse-event-rect")
            .attr("width", this.frameWidth)
            .attr("height", this.frameHeight + this.frameMarginBottom / 2)
            .attr("fill", "none")
            .attr("pointer-events", "all")

        this.addOnMouseMoveEvent(rectangle, x, y, tooltip, dashedVerticalLine, straightVerticalLine, horizontalLine)
        this.addOnMouseOutEvent(rectangle, tooltip, dashedVerticalLine, straightVerticalLine, horizontalLine)
    }

    private addOnMouseMoveEvent(
        rectangle: RectElement,
        xScale: Scale,
        yScale: Scale,
        tooltip: TextElement,
        dashedVerticalLine: LineElement,
        straightVerticalLine: LineElement,
        horizontalLine: LineElement
    ) {
        rectangle.on("mousemove", event => {
            const mouseX = d3.pointer(event)[0]
            let percentile = Math.round(xScale.invert(mouseX - this.framePadding))
            percentile = Math.max(0, Math.min(percentile, 100))
            const metricValue = this.percentileToMetricValueMap.get(percentile)

            const yLinePosition = yScale(metricValue) + this.framePadding

            const xTooltipPosition = mouseX < this.frameWidth / 2 ? mouseX + 10 : mouseX - 80
            const yTooltipPosition = yLinePosition < this.frameHeight / 2 ? yLinePosition + 20 : yLinePosition - 20

            tooltip
                .style("display", "block")
                .attr("x", xTooltipPosition)
                .attr("y", yTooltipPosition)
                .text(`Quantile: ${percentile}`)
                .append("tspan")
                .attr("x", xTooltipPosition)
                .attr("dy", "1.2em")
                .text(`Value: ${metricValue}`)

            dashedVerticalLine.attr("x1", mouseX).attr("x2", mouseX).attr("y2", this.frameHeight).style("display", "block")

            straightVerticalLine
                .attr("x1", mouseX)
                .attr("x2", mouseX)
                .attr("y1", yLinePosition)
                .attr("y2", this.frameHeight)
                .style("display", "block")

            horizontalLine.attr("x2", mouseX).attr("y1", yLinePosition).attr("y2", yLinePosition).style("display", "block")
        })
    }

    private addOnMouseOutEvent(
        rectangle: RectElement,
        tooltip: TextElement,
        dashedVerticalLine: LineElement,
        straightVerticalLine: LineElement,
        horizontalLine: LineElement
    ) {
        rectangle.on("mouseout", () => {
            tooltip.style("display", "none")
            dashedVerticalLine.style("display", "none")
            straightVerticalLine.style("display", "none")
            horizontalLine.style("display", "none")
        })
    }
}
