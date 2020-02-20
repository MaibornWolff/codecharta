import { attributeTypes } from "./attributeTypes.reducer"
import { AttributeTypesAction, setAttributeTypes } from "./attributeTypes.actions"
import { STATE } from "../../../../util/dataMocks"
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
			const result = attributeTypes(defaultValue, setAttributeTypes(STATE.fileSettings.attributeTypes))

			expect(result).toEqual(STATE.fileSettings.attributeTypes)
		})

		it("should set default attributeTypes", () => {
			const result = attributeTypes(STATE.fileSettings.attributeTypes, setAttributeTypes())

			expect(result).toEqual(defaultValue)
		})
	})
})
