import { Pipe, PipeTransform } from "@angular/core"
import { GetAttributeTypeOfNodesByMetric } from "../../state/selectors/getAttributeTypeOfNodesByMetric.selector"

@Pipe({ name: "nodeMetricAggregationType" })
export class NodeMetricAggregationTypePipe implements PipeTransform {
	transform(metricName: string, getAttributeTypeOfNodesByMetricSelector: GetAttributeTypeOfNodesByMetric): string {
		return getAttributeTypeOfNodesByMetricSelector(metricName)
	}
}
