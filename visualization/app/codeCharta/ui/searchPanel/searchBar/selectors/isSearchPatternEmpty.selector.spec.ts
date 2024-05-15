import { _isSearchPatternEmpty } from "./isSearchPatternEmpty.selector"

describe("isSearchPatternEmpty", () => {
    it("should return true for empty string", () => {
        expect(_isSearchPatternEmpty("")).toBe(true)
    })

    it("should return true if string consists of only negation", () => {
        expect(_isSearchPatternEmpty("!")).toBe(true)
    })

    it("should return true if string consists of separation symbol", () => {
        expect(_isSearchPatternEmpty(",")).toBe(true)
    })

    it("should return false for non empty strings", () => {
        expect(_isSearchPatternEmpty("foo")).toBe(false)
    })
})
