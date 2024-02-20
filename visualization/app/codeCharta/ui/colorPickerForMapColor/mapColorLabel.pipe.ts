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
				return isColorMetricUnary
					? `${nodeMetricRange.minValue} - ${nodeMetricRange.minValue}`
					: isFromValueEqualMinValue
					? `-`
					: isFromValueEqualMaxValue
					? `${nodeMetricRange.minValue} to ${this.formatNumber(colorRange.from)}`
					: `${nodeMetricRange.minValue} to ${this.formatNumber(colorRange.from - 1)}`
			}
			case "neutral": {
				const isFromValueEqualToValue = colorRange.from === colorRange.to
				const isToValueEqualMaxValue = colorRange.to === nodeMetricRange.maxValue
				return isFromValueEqualToValue
					? `-`
					: isToValueEqualMaxValue
					? `${this.formatNumber(colorRange.from)} to ${this.formatNumber(colorRange.to)}`
					: `${this.formatNumber(colorRange.from)} to ${this.formatNumber(colorRange.to - 1)}`
			}
			case "negative": {
				const isToValueEqualToMaxValue = nodeMetricRange.maxValue === colorRange.to
				return isToValueEqualToMaxValue
					? `-`
					: `${this.formatNumber(colorRange.to)} to ${this.formatNumber(nodeMetricRange.maxValue)}`
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
