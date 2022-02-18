import { Pipe, PipeTransform } from "@angular/core"

import { ColorRange, MapColors } from "../../codeCharta.model"

@Pipe({ name: "mapColorLabel" })
export class MapColorLabelPipe implements PipeTransform {
	transform(metricName: keyof MapColors, colorRange: ColorRange): string {
		switch (metricName) {
			case "positive":
				return `0 to < ${this.formatNumber(colorRange.from)}`
			case "neutral":
				return `≥ ${this.formatNumber(colorRange.from)} to ≤ ${this.formatNumber(colorRange.to)}`
			case "negative":
				return `> ${this.formatNumber(colorRange.to)} to ${this.formatNumber(colorRange.max)}`
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

	private formatNumber(n: number) {
		return Math.round(n).toLocaleString()
	}
}
