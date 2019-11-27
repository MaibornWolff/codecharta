import { attributeTypes } from "./attributeTypes.reducer"
import { AttributeTypesAction, setAttributeTypes } from "./attributeTypes.actions"

describe("attributeTypes", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = attributeTypes(undefined, {} as AttributeTypesAction)

			expect(result).toEqual({})
		})
	})

	describe("Action: SET_ATTRIBUTE_TYPES", () => {
		it("should set new attributeTypes", () => {
			const result = attributeTypes({}, setAttributeTypes({ another }))

			expect(result).toEqual({ another })
		})
	})
})
