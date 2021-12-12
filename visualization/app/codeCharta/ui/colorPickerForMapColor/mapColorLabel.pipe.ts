import { Pipe, PipeTransform } from "@angular/core"

import { ColorRange, MapColors } from "../../codeCharta.model"

@Pipe({ name: "mapColorLabelPipe" })
export class MapColorLabelPipe implements PipeTransform {
	transform(metricName: keyof MapColors, colorRange: ColorRange): string {
		switch (metricName) {
			case "positive":
				return `0 to < ${Math.floor(colorRange.from)}`
			case "neutral":
				return `≥ ${Math.floor(colorRange.from)} to ≤ ${Math.floor(colorRange.to)}`
			case "negative":
				return `> ${Math.floor(colorRange.to)} to ${Math.floor(colorRange.max)}`
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
