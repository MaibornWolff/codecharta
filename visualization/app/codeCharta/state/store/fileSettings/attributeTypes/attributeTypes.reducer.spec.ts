import { attributeTypes } from "./attributeTypes.reducer"
import { setAttributeTypes, updateAttributeType } from "./attributeTypes.actions"
import { STATE } from "../../../../util/dataMocks"
import { AttributeTypes, AttributeTypeValue } from "../../../../codeCharta.model"

describe("attributeTypes", () => {
	const defaultValue: AttributeTypes = {
		nodes: {},
		edges: {}
	}

	describe("Action: SET_ATTRIBUTE_TYPES", () => {
		it("should set new attributeTypes", () => {
			const result = attributeTypes(defaultValue, setAttributeTypes({ value: STATE.fileSettings.attributeTypes }))

			expect(result).toEqual(STATE.fileSettings.attributeTypes)
		})
	})

	describe("Action: UPDATE_ATTRIBUTE_TYPE", () => {
		it("should update existing", () => {
			const currentState = {
				nodes: { foo: AttributeTypeValue.relative },
				edges: { foo: AttributeTypeValue.absolute, bar: AttributeTypeValue.absolute }
			}
			const expected = {
				nodes: { foo: AttributeTypeValue.relative },
				edges: { foo: AttributeTypeValue.relative, bar: AttributeTypeValue.absolute }
			}

			const result = attributeTypes(
				currentState,
				updateAttributeType({ category: "edges", name: "foo", attributeType: AttributeTypeValue.relative })
			)

			expect(result).toEqual(expected)
		})
	})
})
