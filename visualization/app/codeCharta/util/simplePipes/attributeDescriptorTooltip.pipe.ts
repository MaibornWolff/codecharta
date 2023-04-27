import { Pipe, PipeTransform } from "@angular/core"
import { AttributeDescriptor } from "../../codeCharta.model"
import { metricTitles } from "../metric/metricTitles"

@Pipe({ name: "attributeDescriptorTooltip" })
export class AttributeDescriptorTooltipPipe implements PipeTransform {
	transform(attributeDescriptor: AttributeDescriptor, key: string): string {
		if (attributeDescriptor == null) {
			return metricTitles.get(key) ?? ""
		}
		const title: string = attributeDescriptor.title ? `${attributeDescriptor.title} (${key})` : `${key}`

		let subtitle: string = attributeDescriptor.description ? `\n${attributeDescriptor.description}` : ""
		subtitle += attributeDescriptor.hintHighValue ? `\nHigh Values: ${attributeDescriptor.hintHighValue}` : ""
		subtitle += attributeDescriptor.hintLowValue ? `\nLow Values: ${attributeDescriptor.hintLowValue}` : ""
		subtitle += attributeDescriptor.link ? `\n${attributeDescriptor.link}` : ""

		return subtitle.length > 0 ? `${title}:${subtitle}` : title
	}
}
