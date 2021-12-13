import { Pipe, PipeTransform } from "@angular/core"

import { ColorRange, MapColors } from "../../codeCharta.model"

@Pipe({ name: "mapColorLabelPipe" })
export class MapColorLabelPipe implements PipeTransform {
	transform(metricName: keyof MapColors, colorRange: ColorRange): string {
		switch (metricName) {
			case "positive":
				return `0 to < ${Math.round(colorRange.from)}`
			case "neutral":
				return `≥ ${Math.round(colorRange.from)} to ≤ ${Math.round(colorRange.to)}`
			case "negative":
				return `> ${Math.round(colorRange.to)} to ${Math.round(colorRange.max)}`
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
}
