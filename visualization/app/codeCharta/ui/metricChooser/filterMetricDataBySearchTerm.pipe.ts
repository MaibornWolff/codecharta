import { Pipe, PipeTransform } from "@angular/core"
import { EdgeMetricData, NodeMetricData } from "../../codeCharta.model"

@Pipe({ name: "filterMetricDataBySearchTerm" })
export class FilterMetricDataBySearchTermPipe implements PipeTransform {
	transform(metricData: NodeMetricData[] | EdgeMetricData[], searchTerm: string) {
		const lowercasedSearchTerm = searchTerm.toLocaleLowerCase()
		return metricData.filter(data => data.name.toLocaleLowerCase().includes(lowercasedSearchTerm))
	}
}
