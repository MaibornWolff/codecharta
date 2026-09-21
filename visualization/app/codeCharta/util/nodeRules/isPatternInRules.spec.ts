import { isPatternInRules } from "./isPatternInRules"

describe("isPatternInRules", () => {
    it("should recognize an exact match", () => {
        expect(isPatternInRules([{ path: "*needle*" }], "*needle*")).toBe(true)
    })

    it("should recognize * matches", () => {
        expect(isPatternInRules([{ path: "*needle*" }], "needle")).toBe(true)
    })

    it("should not recognize * vs absolute value", () => {
        expect(isPatternInRules([{ path: "*needle*" }], "/needle")).toBe(false)
    })

    it("should not match a pattern the list does not hold", () => {
        expect(isPatternInRules([{ path: "*haystack*" }], "*needle*")).toBe(false)
    })
})
