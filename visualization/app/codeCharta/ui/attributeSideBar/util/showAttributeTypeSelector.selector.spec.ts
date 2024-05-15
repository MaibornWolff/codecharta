import { _shouldShowAttributeType } from "./showAttributeTypeSelector.selector"

describe("_shouldShowAttributeType", () => {
    it("should return true for none leaves", () => {
        expect(_shouldShowAttributeType({ children: [{}] })).toBe(true)
    })

    it("should return false for leaves", () => {
        expect(_shouldShowAttributeType({})).toBe(false)
    })
})
