import { isPatternRule } from "./isPattern"

describe("isPatternRule", () => {
    it.each(["**/*.spec.ts", "*.js", "file?.ts"])("should be true for the path %s containing a wildcard", path => {
        // Arrange & Act
        const isPattern = isPatternRule(path)

        // Assert
        expect(isPattern).toBe(true)
    })

    it("should be false for paths starting with negation but no wildcard", () => {
        // Arrange & Act
        const isPattern = isPatternRule("!something")

        // Assert
        expect(isPattern).toBe(false)
    })

    it.each(["apps/web/src/legacy", "/some/path"])("should be false for the concrete path %s", path => {
        // Arrange & Act
        const isPattern = isPatternRule(path)

        // Assert
        expect(isPattern).toBe(false)
    })
})
