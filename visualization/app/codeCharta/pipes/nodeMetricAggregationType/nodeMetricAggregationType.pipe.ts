import { Pipe, PipeTransform } from "@angular/core"
import { GetAttributeType } from "../../state/selectors/getAttributeTypeOfNodesByMetric.selector"

@Pipe({ name: "nodeMetricAggregationType" })
export class NodeMetricAggregationTypePipe implements PipeTransform {
	transform(metricName: string, getAttributeType: GetAttributeType): string {
		// see #2731 for hard coded "nodes" value
		return getAttributeType("nodes", metricName)
	}
}
