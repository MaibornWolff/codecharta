import { Pipe, PipeTransform } from "@angular/core"

import { AttributeTypeValue } from "../../../codeCharta.model"
import { GetAttributeTypeOfNodesByMetric } from "../../../state/selectors/getAttributeTypeOfNodesByMetric.selector"

@Pipe({ name: "aggregationTypePipe" })
export class AggregationTypePipePipe implements PipeTransform {
	transform(metricName: string, getAttributeTypeOfNodesByMetricSelector: GetAttributeTypeOfNodesByMetric): string {
		const type = getAttributeTypeOfNodesByMetricSelector(metricName)
		switch (type) {
			case AttributeTypeValue.relative:
				return "median"
			case AttributeTypeValue.absolute:
			default:
				return "sum"
		}
	}
}
