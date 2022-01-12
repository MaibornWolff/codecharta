import { Pipe, PipeTransform } from "@angular/core"

import { AttributeTypeValue } from "../../../codeCharta.model"
import { GetAttributeTypeOfNodesByMetric } from "../../../state/selectors/getAttributeTypeOfNodesByMetric.selector"

@Pipe({ name: "aggregationSymbolPipe" })
export class AggregationSymbolPipe implements PipeTransform {
	transform(metricName: string, getAttributeTypeOfNodesByMetricSelector: GetAttributeTypeOfNodesByMetric): string {
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
