import { isPatternRule } from "./isPattern"

describe("isPatternRule", () => {
    it("should be true for paths containing wildcard", () => {
        expect(isPatternRule("**/*.spec.ts")).toBe(true)
        expect(isPatternRule("*.js")).toBe(true)
    })

    it("should be false for paths starting with negation but no wildcard", () => {
        expect(isPatternRule("!something")).toBe(false)
    })

    it("should be true for paths with question mark", () => {
        expect(isPatternRule("file?.ts")).toBe(true)
    })

    it("should be false for concrete paths", () => {
        expect(isPatternRule("apps/web/src/legacy")).toBe(false)
        expect(isPatternRule("/some/path")).toBe(false)
    })
})
