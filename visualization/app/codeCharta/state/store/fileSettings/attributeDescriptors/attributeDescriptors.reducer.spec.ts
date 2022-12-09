import { attributeDescriptors } from "./attributeDescriptors.reducer"
import { STATE } from "../../../../util/dataMocks"
import { AttributeDescriptors } from "../../../../codeCharta.model"
import { AttributeDescriptorsAction, setAttributeDescriptors } from "./attributeDescriptors.action"

describe("attributeDescriptors", () => {
	const defaultValue: AttributeDescriptors = {}

	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = attributeDescriptors(undefined, {} as AttributeDescriptorsAction)

			expect(result).toEqual(defaultValue)
		})
	})

	describe("Action: SET_ATTRIBUTE_DESCRIPTORS", () => {
		it("should set new attributeDescriptors", () => {
			const result = attributeDescriptors(defaultValue, setAttributeDescriptors(STATE.fileSettings.attributeDescriptors))

			expect(result).toEqual(STATE.fileSettings.attributeDescriptors)
		})

		it("should set default attributeDescriptors", () => {
			const result = attributeDescriptors(STATE.fileSettings.attributeDescriptors, setAttributeDescriptors())

			expect(result).toEqual(defaultValue)
		})
	})
})
