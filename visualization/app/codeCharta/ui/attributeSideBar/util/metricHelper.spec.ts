import { shouldShowAttributeTypeSelector } from "./metricHelper"

describe("metricHelper", () => {
	it("should return true for none leaves", () => {
		expect(shouldShowAttributeTypeSelector({ isLeaf: false })).toBe(true)
	})

	it("should return false for leaves", () => {
		expect(shouldShowAttributeTypeSelector({ isLeaf: true })).toBe(false)
	})
})
