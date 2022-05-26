import { Pipe, PipeTransform } from "@angular/core"
import { NodeMetricData } from "../../codeCharta.model"

@Pipe({ name: "filterNodeMetricDataBySearchTerm" })
export class FilterNodeMetricDataBySearchTermPipe implements PipeTransform {
	transform(nodeMetricData: NodeMetricData[], searchTerm: string) {
		const lowercasedSearchTerm = searchTerm.toLocaleLowerCase()
		return nodeMetricData.filter(data => data.name.toLocaleLowerCase().includes(lowercasedSearchTerm))
	}
}
