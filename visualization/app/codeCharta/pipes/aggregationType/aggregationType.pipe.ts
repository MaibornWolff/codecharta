import { Pipe, PipeTransform } from "@angular/core"
import { AttributeTypes } from "../../codeCharta.model"
import { GetAttributeType } from "../../state/selectors/getAttributeTypeOfNodesByMetric.selector"

@Pipe({ name: "aggregationType" })
export class AggregationTypePipe implements PipeTransform {
	transform(getAttributeType: GetAttributeType, metricType: keyof AttributeTypes, metricName: string): string {
		return getAttributeType(metricType, metricName) ?? "absolute"
	}
}
