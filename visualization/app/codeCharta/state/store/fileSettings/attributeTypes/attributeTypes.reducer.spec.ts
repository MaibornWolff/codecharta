import { attributeTypes } from "./attributeTypes.reducer"
import { AttributeTypesAction, setAttributeTypes, updateAttributeType } from "./attributeTypes.actions"
import { STATE } from "../../../../util/dataMocks"
import { AttributeTypes, AttributeTypeValue } from "../../../../codeCharta.model"

describe("attributeTypes", () => {
	const defaultValue: AttributeTypes = {
		nodes: {},
		edges: {}
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

	describe("Action: UPDATE_ATTRIBUTE_TYPE", () => {
		it("should set new attributeType if not existing yet", () => {
			const result = attributeTypes(defaultValue, updateAttributeType("edges", "foo", AttributeTypeValue.relative))

			expect(result).toEqual({ nodes: {}, edges: { foo: AttributeTypeValue.relative } })
		})

		it("should update existing", () => {
			const currentState = {
				nodes: { foo: AttributeTypeValue.relative },
				edges: { foo: AttributeTypeValue.absolute, bar: AttributeTypeValue.absolute }
			}
			const expected = {
				nodes: { foo: AttributeTypeValue.relative },
				edges: { foo: AttributeTypeValue.relative, bar: AttributeTypeValue.absolute }
			}

			const result = attributeTypes(currentState, updateAttributeType("edges", "foo", AttributeTypeValue.relative))

			expect(result).toEqual(expected)
		})
	})
})
