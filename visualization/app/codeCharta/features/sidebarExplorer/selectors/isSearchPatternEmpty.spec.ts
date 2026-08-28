import { isSearchPatternEmpty } from "./isSearchPatternEmpty"

describe("isSearchPatternEmpty", () => {
    it("should return true for empty string", () => {
        expect(isSearchPatternEmpty("")).toBe(true)
    })

    it("should return true if string consists of only negation", () => {
        expect(isSearchPatternEmpty("!")).toBe(true)
    })

    it("should return true if string consists of separation symbol", () => {
        expect(isSearchPatternEmpty(",")).toBe(true)
    })

    it("should return false for non empty strings", () => {
        expect(isSearchPatternEmpty("foo")).toBe(false)
    })
})
