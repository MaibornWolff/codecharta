import { Pipe, PipeTransform } from "@angular/core"
import { AttributeDescriptor } from "../../codeCharta.model"

@Pipe({ name: "attributeDescriptorTooltip" })
export class AttributeDescriptorTooltipPipe implements PipeTransform {
	transform(attributeDescriptor: AttributeDescriptor, key: string): string {
		if (attributeDescriptor == null) {
			return ""
		}
		return key + attributeDescriptor.description
	}
}
