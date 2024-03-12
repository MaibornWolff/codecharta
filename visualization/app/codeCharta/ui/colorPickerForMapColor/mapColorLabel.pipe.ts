import { Pipe, PipeTransform } from "@angular/core"

import { ColorRange, MapColors } from "../../codeCharta.model"
import { MetricMinMax } from "../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"

@Pipe({ name: "mapColorLabel" })
export class MapColorLabelPipe implements PipeTransform {
	transform(metricName: keyof MapColors, colorRange: ColorRange, nodeMetricRange: MetricMinMax, colorMetric: string): string {
		switch (metricName) {
			case "positive": {
				const isColorMetricUnary = colorMetric === "unary"
				const isFromValueEqualMinValue = nodeMetricRange.minValue === colorRange.from
				const isFromValueEqualMaxValue = nodeMetricRange.maxValue === colorRange.from
				if (isColorMetricUnary) {
					return `${nodeMetricRange.minValue} - ${nodeMetricRange.maxValue}`
				}
				if (isFromValueEqualMinValue) {
					return `-`
				}
				if (isFromValueEqualMaxValue) {
					return `${nodeMetricRange.minValue} to ${this.formatNumber(colorRange.from)}`
				}
				return `${nodeMetricRange.minValue} to ${this.formatNumber(colorRange.from - 1)}`
			}
			case "neutral": {
				const isFromValueEqualToValue = colorRange.from === colorRange.to
				const isToValueEqualMaxValue = colorRange.to === nodeMetricRange.maxValue
				if (isFromValueEqualToValue) {
					return `-`
				}
				if (isToValueEqualMaxValue) {
					return `${this.formatNumber(colorRange.from)} to ${this.formatNumber(colorRange.to)}`
				}
				return `${this.formatNumber(colorRange.from)} to ${this.formatNumber(colorRange.to - 1)}`
			}
			case "negative": {
				const isToValueEqualToMaxValue = nodeMetricRange.maxValue === colorRange.to
				if (isToValueEqualToMaxValue) {
					return `-`
				}
				return `${this.formatNumber(colorRange.to)} to ${this.formatNumber(nodeMetricRange.maxValue)}`
			}
			case "positiveDelta":
				return "+Δ positive delta"
			case "negativeDelta":
				return "–Δ negative delta"
			case "selected":
				return "selected"
			case "outgoingEdge":
				return "Outgoing Edge"
			case "incomingEdge":
				return "Incoming Edge"
		}
	}

	private formatNumber(n?: number) {
		return (n || 0).toLocaleString()
	}
}
