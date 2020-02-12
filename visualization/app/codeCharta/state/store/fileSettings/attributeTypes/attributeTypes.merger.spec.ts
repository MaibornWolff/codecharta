import { getMergedAttributeTypes } from "./attributeTypes.merger"
import { AttributeTypes, AttributeTypeValue } from "../../../../model/codeCharta.model"

describe("AttributeTypesMerger", () => {
	describe("getMergedAttributeTypes", () => {
		let attributes1: AttributeTypes
		let attributes2: AttributeTypes
		let attributes3: AttributeTypes

		beforeEach(() => {
			attributes1 = {
				nodes: [
					{ attribute1: AttributeTypeValue.relative },
					{ attribute2: AttributeTypeValue.absolute },
					{ attribute3: AttributeTypeValue.relative }
				],
				edges: [{ attribute4: AttributeTypeValue.relative }, { attribute5: AttributeTypeValue.absolute }]
			}

			attributes2 = {
				nodes: [
					{ attribute1: AttributeTypeValue.absolute },
					{ attribute3: AttributeTypeValue.relative },
					{ attribute4: AttributeTypeValue.absolute }
				],
				edges: [
					{ attribute4: AttributeTypeValue.absolute },
					{ attribute6: AttributeTypeValue.absolute },
					{ attribute7: AttributeTypeValue.relative }
				]
			}

			attributes3 = {
				nodes: [{ attribute1: AttributeTypeValue.relative }, { attribute3: AttributeTypeValue.absolute }],
				edges: []
			}
		})

		it("should merge different attributeTypes and only contain unique attributeType keys", () => {
			const attributeTypes = getMergedAttributeTypes([attributes1, attributes2])

			const expected = {
				nodes: [
					{ attribute1: AttributeTypeValue.relative },
					{ attribute2: AttributeTypeValue.absolute },
					{ attribute3: AttributeTypeValue.relative },
					{ attribute4: AttributeTypeValue.absolute }
				],
				edges: [
					{ attribute4: AttributeTypeValue.relative },
					{ attribute5: AttributeTypeValue.absolute },
					{ attribute6: AttributeTypeValue.absolute },
					{ attribute7: AttributeTypeValue.relative }
				]
			}

			expect(attributeTypes).toEqual(expected)
		})

		it("should merge attributeTypes if one file does not contain attributeTypes", () => {
			const attributeTypes = getMergedAttributeTypes([attributes1, attributes3])

			const expected = {
				nodes: [
					{ attribute1: AttributeTypeValue.relative },
					{ attribute2: AttributeTypeValue.absolute },
					{ attribute3: AttributeTypeValue.relative }
				],
				edges: [{ attribute4: AttributeTypeValue.relative }, { attribute5: AttributeTypeValue.absolute }]
			}

			expect(attributeTypes).toEqual(expected)
		})
	})
})
