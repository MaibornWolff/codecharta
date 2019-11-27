import { attributeTypes } from "./attributeTypes.reducer"
import { AttributeTypesAction, setAttributeTypes } from "./attributeTypes.actions"
import { SETTINGS } from "../../../../util/dataMocks"
import { AttributeTypes } from "../../../../codeCharta.model"

describe("attributeTypes", () => {
	const defaultValue: AttributeTypes = {
		nodes: [],
		edges: []
	}

	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = attributeTypes(undefined, {} as AttributeTypesAction)

			expect(result).toEqual(defaultValue)
		})
	})

	describe("Action: SET_ATTRIBUTE_TYPES", () => {
		it("should set new attributeTypes", () => {
			const result = attributeTypes(defaultValue, setAttributeTypes(SETTINGS.fileSettings.attributeTypes))

			expect(result).toEqual(SETTINGS.fileSettings.attributeTypes)
		})
	})
})
