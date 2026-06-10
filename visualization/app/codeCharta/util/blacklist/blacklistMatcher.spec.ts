import { BlacklistItem } from "../../codeCharta.model"
import { createBlacklistMatcher, isPathHiddenOrExcluded } from "./blacklistMatcher"

describe("blacklistMatcher", () => {
    describe("createBlacklistMatcher", () => {
        it("should wrap a plain path so any node containing it matches, like NodeDecorator", () => {
            // Arrange
            const matcher = createBlacklistMatcher([{ type: "exclude", path: "/root/src/file.ts" }])

            // Act & Assert
            expect(matcher.isExcludedLeaf("/root/src/file.ts")).toBe(true)
            expect(matcher.isExcludedLeaf("/root/src/other.ts")).toBe(false)
        })

        it("should split comma-separated rule paths into individual patterns", () => {
            // Arrange
            const matcher = createBlacklistMatcher([{ type: "exclude", path: "*.html, *.css" }])

            // Act & Assert
            expect(matcher.isExcludedLeaf("/root/a/index.html")).toBe(true)
            expect(matcher.isExcludedLeaf("/root/a/style.css")).toBe(true)
            expect(matcher.isExcludedLeaf("/root/a/app.ts")).toBe(false)
        })

        it("should exclude every leaf that does not match a negated rule", () => {
            // Arrange
            const matcher = createBlacklistMatcher([{ type: "exclude", path: "!*keep*" }])

            // Act & Assert
            expect(matcher.isExcludedLeaf("/root/src/drop.ts")).toBe(true)
            expect(matcher.isExcludedLeaf("/root/src/keep.ts")).toBe(false)
        })

        it("should never report a whole subtree as excluded based on a negated rule", () => {
            // Arrange: the folder does not match "*keep*", but it can still contain
            // leaves that do — pruning it would hide nodes NodeDecorator keeps
            const matcher = createBlacklistMatcher([{ type: "exclude", path: "!*keep*" }])

            // Act & Assert
            expect(matcher.isExcludedSubtree("/root/src")).toBe(false)
            expect(matcher.isExcludedLeaf("/root/src/drop.ts")).toBe(true)
        })

        it("should report a whole subtree as excluded when a positive rule matches the folder", () => {
            // Arrange
            const matcher = createBlacklistMatcher([{ type: "exclude", path: "/root/src" }])

            // Act & Assert
            expect(matcher.isExcludedSubtree("/root/src")).toBe(true)
            expect(matcher.isExcludedLeaf("/root/src/file.ts")).toBe(true)
        })

        it("should flatten any node matching a flatten rule without affecting exclusion", () => {
            // Arrange
            const matcher = createBlacklistMatcher([{ type: "flatten", path: "*.spec.ts" }])

            // Act & Assert
            expect(matcher.isFlattened("/root/src/file.spec.ts")).toBe(true)
            expect(matcher.isExcludedLeaf("/root/src/file.spec.ts")).toBe(false)
        })
    })

    describe("isPathHiddenOrExcluded", () => {
        it("should agree with the shared matcher semantics instead of raw gitignore matching", () => {
            // Arrange: a plain path rule is wrapped (*path*), so the exact leaf matches
            const blacklist: BlacklistItem[] = [{ path: "/root/src/file.ts", type: "exclude" }]

            // Act & Assert
            expect(isPathHiddenOrExcluded("/root/src/file.ts", blacklist)).toBe(true)
            expect(isPathHiddenOrExcluded("/root/src/unrelated.ts", blacklist)).toBe(false)
        })

        it("should respect negated rules like NodeDecorator does", () => {
            // Arrange
            const blacklist: BlacklistItem[] = [{ path: "!*keep*", type: "exclude" }]

            // Act & Assert
            expect(isPathHiddenOrExcluded("/root/src/drop.ts", blacklist)).toBe(true)
            expect(isPathHiddenOrExcluded("/root/src/keep.ts", blacklist)).toBe(false)
        })

        it("should detect flattened paths", () => {
            // Arrange
            const blacklist: BlacklistItem[] = [{ path: "*.spec.ts", type: "flatten" }]

            // Act & Assert
            expect(isPathHiddenOrExcluded("/root/src/file.spec.ts", blacklist)).toBe(true)
        })
    })
})
