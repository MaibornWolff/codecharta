import { createExcludeMatcher } from "./excludeMatcher"

describe("excludeMatcher", () => {
    it("should exclude a node by its full path", () => {
        // Arrange
        const matcher = createExcludeMatcher([{ path: "/root/src/file.ts" }])

        // Act & Assert
        expect(matcher.isExcludedLeaf("/root/src/file.ts")).toBe(true)
        expect(matcher.isExcludedLeaf("/root/src/other.ts")).toBe(false)
    })

    it("should not exclude a sibling folder whose name starts with the name of the excluded folder", () => {
        // Arrange
        const matcher = createExcludeMatcher([{ path: "/root/src/app" }])

        // Act & Assert
        expect(matcher.isExcludedLeaf("/root/src/app/file.ts")).toBe(true)
        expect(matcher.isExcludedSubtree("/root/src/application")).toBe(false)
        expect(matcher.isExcludedLeaf("/root/src/application/file.ts")).toBe(false)
    })

    it("should not exclude a file whose extension starts with the excluded extension inside a folder", () => {
        // Arrange
        const matcher = createExcludeMatcher([{ path: "/root/src/**/*.ts" }])

        // Act & Assert
        expect(matcher.isExcludedLeaf("/root/src/app/file.ts")).toBe(true)
        expect(matcher.isExcludedLeaf("/root/src/app/view.tsx")).toBe(false)
    })

    it("should keep every path of a rule exact, not only its first one", () => {
        // Arrange
        const matcher = createExcludeMatcher([{ path: "/root/src/app, /root/test/app" }])

        // Act & Assert
        expect(matcher.isExcludedLeaf("/root/test/app/file.ts")).toBe(true)
        expect(matcher.isExcludedLeaf("/root/test/application/file.ts")).toBe(false)
    })

    it("should still match any node containing a bare rule", () => {
        // Arrange
        const matcher = createExcludeMatcher([{ path: "app" }])

        // Act & Assert
        expect(matcher.isExcludedLeaf("/root/src/application/file.ts")).toBe(true)
    })

    it("should split comma-separated rule paths into individual patterns", () => {
        // Arrange
        const matcher = createExcludeMatcher([{ path: "*.html, *.css" }])

        // Act & Assert
        expect(matcher.isExcludedLeaf("/root/a/index.html")).toBe(true)
        expect(matcher.isExcludedLeaf("/root/a/style.css")).toBe(true)
        expect(matcher.isExcludedLeaf("/root/a/app.ts")).toBe(false)
    })

    it("should exclude every leaf that does not match a negated rule", () => {
        // Arrange
        const matcher = createExcludeMatcher([{ path: "!*keep*" }])

        // Act & Assert
        expect(matcher.isExcludedLeaf("/root/src/drop.ts")).toBe(true)
        expect(matcher.isExcludedLeaf("/root/src/keep.ts")).toBe(false)
    })

    it("should never report a whole subtree as excluded based on a negated rule", () => {
        // Arrange: the folder does not match "*keep*", but it can still contain
        // leaves that do — pruning it would hide nodes NodeDecorator keeps
        const matcher = createExcludeMatcher([{ path: "!*keep*" }])

        // Act & Assert
        expect(matcher.isExcludedSubtree("/root/src")).toBe(false)
        expect(matcher.isExcludedLeaf("/root/src/drop.ts")).toBe(true)
    })

    it("should report a whole subtree as excluded when a positive rule matches the folder", () => {
        // Arrange
        const matcher = createExcludeMatcher([{ path: "/root/src" }])

        // Act & Assert
        expect(matcher.isExcludedSubtree("/root/src")).toBe(true)
        expect(matcher.isExcludedLeaf("/root/src/file.ts")).toBe(true)
    })
})
