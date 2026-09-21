import { createFlattenMatcher } from "./flattenMatcher"

describe("flattenMatcher", () => {
    it("should flatten any node matching a rule, leaf or folder", () => {
        // Arrange
        const matcher = createFlattenMatcher([{ path: "*.spec.ts" }])

        // Act & Assert
        expect(matcher.isFlattened("/root/src/file.spec.ts")).toBe(true)
        expect(matcher.isFlattened("/root/src/file.ts")).toBe(false)
    })

    it("should flatten every node that does not match a negated rule", () => {
        // Arrange
        const matcher = createFlattenMatcher([{ path: "!*keep*" }])

        // Act & Assert
        expect(matcher.isFlattened("/root/src/drop.ts")).toBe(true)
        expect(matcher.isFlattened("/root/src/keep.ts")).toBe(false)
    })

    it("should hold no rules when the list is empty", () => {
        // Arrange
        const matcher = createFlattenMatcher([])

        // Act & Assert
        expect(matcher.isFlattened("/root/src/file.ts")).toBe(false)
    })
})
