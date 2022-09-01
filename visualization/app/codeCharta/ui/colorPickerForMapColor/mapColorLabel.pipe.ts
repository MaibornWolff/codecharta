import { Pipe, PipeTransform } from "@angular/core"

import { ColorRange, MapColors } from "../../codeCharta.model"
import { MetricMinMax } from "../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"

@Pipe({ name: "mapColorLabel" })
export class MapColorLabelPipe implements PipeTransform {
	transform(metricName: keyof MapColors, colorRange: ColorRange, nodeMetricRange: MetricMinMax): string {
		switch (metricName) {
			case "positive":
				return `${nodeMetricRange.minValue} to < ${this.formatNumber(colorRange.from)}`
			case "neutral":
				return `≥ ${this.formatNumber(colorRange.from)} to ≤ ${this.formatNumber(colorRange.to)}`
			case "negative":
				return `> ${this.formatNumber(colorRange.to)} to ${this.formatNumber(nodeMetricRange.maxValue)}`
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
