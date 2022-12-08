import { Pipe, PipeTransform } from "@angular/core"
import { MetricChooserMetric } from "./metricChooserMetric"

@Pipe({ name: "filterMetricDataBySearchTerm" })
export class FilterMetricDataBySearchTermPipe implements PipeTransform {
	transform(metricData: MetricChooserMetric[], searchTerm: string) {
		const lowercaseSearchTerm = searchTerm.toLocaleLowerCase()
		return metricData.filter(
			data =>
				data.key.toLocaleLowerCase().includes(lowercaseSearchTerm) || data?.title?.toLocaleLowerCase().includes(lowercaseSearchTerm)
		)
	}
}
