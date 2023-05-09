import { attributeDescriptors, defaultAttributeDescriptors } from "./attributeDescriptors.reducer"
import { AttributeDescriptors } from "../../../../codeCharta.model"
import { setAttributeDescriptors } from "./attributeDescriptors.action"

describe("attributeDescriptors", () => {
	it("should set new attributeDescriptors", () => {
		const newAttributeDescriptors: AttributeDescriptors = {
			rloc: {
				title: "title",
				description: "description",
				hintLowValue: "hintLowValue",
				hintHighValue: "hintHighValue",
				link: "link"
			}
		}

		const result = attributeDescriptors(defaultAttributeDescriptors, setAttributeDescriptors({ value: newAttributeDescriptors }))

		expect(result).toEqual(newAttributeDescriptors)
	})
})
