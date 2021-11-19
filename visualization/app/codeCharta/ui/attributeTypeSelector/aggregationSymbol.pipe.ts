import { Pipe, PipeTransform } from "@angular/core"

import { AttributeTypeValue } from "../../codeCharta.model"

@Pipe({ name: "aggregationSymbolPipe" })
export class AggregationSymbolPipe implements PipeTransform {
	transform(metricName: string, getAttributeTypeOfNodesByMetricSelector: (metricName: string) => AttributeTypeValue): string {
		const type = getAttributeTypeOfNodesByMetricSelector(metricName)
		switch (type) {
			case AttributeTypeValue.relative:
				return "x͂"
			case AttributeTypeValue.absolute:
			default:
				return "Σ"
		}
	}
}
