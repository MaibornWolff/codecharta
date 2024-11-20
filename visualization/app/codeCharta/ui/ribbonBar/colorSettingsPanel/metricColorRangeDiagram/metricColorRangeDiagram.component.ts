import { Component, Input, OnChanges } from "@angular/core"
import * as d3 from "d3"

type VGElement = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
type GElement = d3.Selection<SVGGElement, unknown, HTMLElement, any>
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
    @Input() isAttributeDirectionInversed: boolean

    private svgWidth: number
    private framePadding: number
    private svgHeight: number
    private innerDiagramWidth: number
    private innerDiagramHeight: number
    private frameMarginTop: number
    private frameMarginBottom: number
    private frameMarginLeft: number
    private frameMarginRight: number
    private yLabelYOffset: number
    private xLabelYOffset: number
    private percentileRanks: { x: number; y: number }[]

    ngOnChanges() {
        if (this.values.length > 0) {
            this.percentileRanks = this.isAttributeDirectionInversed
                ? this.calculateReversedPercentileRanks(this.values)
                : this.calculatePercentileRanks(this.values)
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
        this.svgWidth = 550
        this.svgHeight = 250

        this.frameMarginTop = 15
        this.frameMarginBottom = 50
        this.frameMarginLeft = 50
        this.frameMarginRight = 50
        this.framePadding = 5

        this.innerDiagramWidth = this.svgWidth - this.frameMarginLeft - this.frameMarginRight - 2 * this.framePadding
        this.innerDiagramHeight = this.svgHeight - this.frameMarginTop - this.frameMarginBottom - 2 * this.framePadding

        this.yLabelYOffset = -42
        this.xLabelYOffset = 20
    }

    private clearDiagramContainer() {
        d3.select("#cc-range-diagram-container").selectAll("*").remove()
    }

    private createSvg() {
        return d3.select("#cc-range-diagram-container").append("svg").attr("width", this.svgWidth).attr("height", this.svgHeight)
    }

    private createGroup(svg: VGElement) {
        return svg.append("g").attr("transform", `translate(${this.frameMarginLeft}, ${this.frameMarginTop})`)
    }

    private drawFrame(g: GElement) {
        g.append("path")
            .attr(
                "d",
                `M ${-this.framePadding} ${-this.framePadding}
                h${this.innerDiagramWidth + 2 * this.framePadding} v${this.innerDiagramHeight + 2 * this.framePadding}
                h${-this.innerDiagramWidth - 2 * this.framePadding} v${-this.innerDiagramHeight - 2 * this.framePadding}`
            )
            .attr("fill", "none")
            .attr("stroke", "#888")
            .attr("stroke-width", "1px")
    }

    private drawAxes(g: GElement, x: Scale, y: Scale) {
        g.append("g")
            .attr("id", "axis-x")
            .attr("transform", `translate(0,${this.innerDiagramHeight + this.framePadding})`)
            .call(d3.axisBottom(x).ticks(5))
            .attr("font-size", "13px")
            .attr("color", "#888")

        g.append("g")
            .attr("id", "axis-y")
            .attr("transform", `translate(${-this.framePadding}, 0)`)
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
            .range([0, this.innerDiagramWidth])
    }

    private createYScale() {
        const domainStandard = [0, d3.max(this.percentileRanks, d => d["y"] as number)]
        const domainInversed = [d3.max(this.percentileRanks, d => d["y"] as number), 0]

        return d3
            .scaleLinear()
            .domain(this.isAttributeDirectionInversed ? domainInversed : domainStandard)
            .range([this.innerDiagramHeight, 0])
    }

    private drawLabels(g: GElement) {
        const pathStartY = -this.framePadding
        const pathHeight = this.innerDiagramHeight + 2 * this.framePadding
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
            .attr("x", this.innerDiagramWidth / 2)
            .attr("y", this.innerDiagramHeight + this.frameMarginTop + 2 * this.framePadding + this.xLabelYOffset)
            .attr("fill", "#888")
            .text(`Quantiles (% of ${this.colorMetric})`)
    }

    private drawAreas(g: GElement, x: Scale) {
        const leftValue = x(
            this.isAttributeDirectionInversed
                ? this.calculateReversedPercentileFromMetricValue(this.currentRightValue)
                : this.calculatePercentileFromMetricValue(this.currentLeftValue)
        )
        const rightValue = x(
            this.isAttributeDirectionInversed
                ? this.calculateReversedPercentileFromMetricValue(this.currentLeftValue)
                : this.calculatePercentileFromMetricValue(this.currentRightValue)
        )

        g.append("rect")
            .attr("class", "left-area")
            .attr("x", 0)
            .attr("y", -this.framePadding)
            .attr("width", leftValue)
            .attr("height", this.innerDiagramHeight + 2 * this.framePadding)
            .style("fill", this.isAttributeDirectionInversed ? this.rightColor : this.leftColor)
            .style("fill-opacity", "0.3")

        g.append("rect")
            .attr("class", "middle-area")
            .attr("x", leftValue)
            .attr("y", -this.framePadding)
            .attr("width", rightValue - leftValue)
            .attr("height", this.innerDiagramHeight + 2 * this.framePadding)
            .style("fill", this.middleColor)
            .style("fill-opacity", "0.3")

        g.append("rect")
            .attr("class", "right-area")
            .attr("x", rightValue)
            .attr("y", -this.framePadding)
            .attr("width", this.innerDiagramWidth - rightValue)
            .attr("height", this.innerDiagramHeight + 2 * this.framePadding)
            .style("fill", this.isAttributeDirectionInversed ? this.leftColor : this.rightColor)
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
}
