import { AttributeDescriptors } from "../../../../codeCharta.model"

export function getMergedAttributeDescriptors(allAttributeDescriptors: AttributeDescriptors[]): AttributeDescriptors {
	const uniqueAttributeDescriptors = {}

	for (const attributeDescriptors of allAttributeDescriptors) {
		for (const attributeDescriptorKey of Object.keys(attributeDescriptors)) {
			if (!uniqueAttributeDescriptors[attributeDescriptorKey]) {
				uniqueAttributeDescriptors[attributeDescriptorKey] = attributeDescriptors[attributeDescriptorKey]
			}
		}
	}

	return uniqueAttributeDescriptors
}
