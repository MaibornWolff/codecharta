import { Pipe, PipeTransform } from "@angular/core"
import { MetricDescriptors } from "../../ui/attributeSideBar/util/metricDescriptors"

@Pipe({ name: "metricDescriptorTitle" })
export class MetricDescriptorTitlePipe implements PipeTransform {
	transform(metricDescriptor: MetricDescriptors): string {
		if (metricDescriptor == null) {
			return ""
		}
		const title: string = metricDescriptor.title ? `${metricDescriptor.title} (${metricDescriptor.key})` : metricDescriptor.key

		let subtitle: string = metricDescriptor.description ? `\n${metricDescriptor.description}` : ""
		subtitle += metricDescriptor.hintHighValue ? `\nHigh Values: ${metricDescriptor.hintHighValue}` : ""
		subtitle += metricDescriptor.hintLowValue ? `\nLow Values: ${metricDescriptor.hintLowValue}` : ""
		subtitle += metricDescriptor.link ? `\n${metricDescriptor.link}` : ""

		return subtitle.length > 0 ? `${title}:${subtitle}` : title
	}
}
