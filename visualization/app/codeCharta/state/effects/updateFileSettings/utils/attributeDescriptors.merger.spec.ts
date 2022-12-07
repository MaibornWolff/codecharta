import { AttributeDescriptors } from "../../../../codeCharta.model"
import { getMergedAttributeDescriptors } from "./attributeDescriptors.merger"

describe("AttributeDescriptorsMerger", () => {
	describe("getMergedAttributeDescriptors", () => {
		let attributes1: AttributeDescriptors
		let attributes2: AttributeDescriptors
		let attributes3: AttributeDescriptors
		let attributes4: AttributeDescriptors

		beforeEach(() => {
			attributes1 = undefined

			attributes2 = {}

			attributes3 = {
				rloc: {
					title: "rloc3",
					description: "",
					hintLowValue: "",
					hintHighValue: "",
					link: "https://www.npmjs.com/package/metric-gardener"
				}
			}

			attributes4 = {
				rloc: {
					title: "rloc4",
					description: "DescriptionRloc4",
					hintLowValue: "",
					hintHighValue: "",
					link: "https://www.npmjs.com/package/metric-gardener"
				},
				comment_lines: {
					title: "Comment Lines",
					description: "Number of lines containing either comment or commented-out code",
					hintLowValue: "",
					hintHighValue: "",
					link: "https://www.npmjs.com/package/metric-gardener"
				}
			}
		})

		it("should skip undefined descriptors (do we really need this edge case?)", () => {
			const attributeDescriptors = getMergedAttributeDescriptors([attributes1, attributes2])

			const expected = {}

			expect(attributeDescriptors).toEqual(expected)
		})

		it("should merge attributeDescriptors if one file does not contain any attributeDescriptors", () => {
			const attributeDescriptors = getMergedAttributeDescriptors([attributes2, attributes3])

			expect(attributeDescriptors).toEqual(attributes3)
		})

		it("should merge attributeDescriptors. If they share the same key, simply take the first attributeDescriptor", () => {
			const attributeDescriptors = getMergedAttributeDescriptors([attributes3, attributes4])

			const expected = {
				rloc: {
					title: "rloc3",
					description: "",
					hintLowValue: "",
					hintHighValue: "",
					link: "https://www.npmjs.com/package/metric-gardener"
				},
				comment_lines: {
					title: "Comment Lines",
					description: "Number of lines containing either comment or commented-out code",
					hintLowValue: "",
					hintHighValue: "",
					link: "https://www.npmjs.com/package/metric-gardener"
				}
			}

			expect(attributeDescriptors).toEqual(expected)
		})
	})
})
