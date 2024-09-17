import { normalizePath, isChildPath } from "./isChildPath"

describe("normalizePath", () => {
    it("should handle empty input", () => {
        expect(normalizePath("")).toBe(undefined)
    })

    it("should handle root input", () => {
        expect(normalizePath("/")).toBe("/")
    })

    it("should remove single dot segments", () => {
        expect(normalizePath("/a/./b")).toBe("/a/b")
    })

    it("should handle double dot segments", () => {
        expect(normalizePath("/a/b/../c")).toBe("/a/c")
    })

    it("should handle multiple slashes", () => {
        expect(normalizePath("/a////b")).toBe("/a/b")
    })

    it("should handle complex paths", () => {
        expect(normalizePath("/a/./b/../../c/./d")).toBe("/c/d")
    })

    it("should handle paths without leading slash", () => {
        expect(normalizePath("a/./b/../../c/./d")).toBe("/c/d")
    })
})

describe("isChildPath", () => {
    it("should return false for empty input", () => {
        expect(isChildPath("", "/parent")).toBe(false)
        expect(isChildPath("/child", "")).toBe(false)
    })

    it("should return false if the potential child is not a child of the potential parent", () => {
        expect(isChildPath("/child", "/parent")).toBe(false)
    })

    it("should return true if the potential child is a direct child of the potential parent", () => {
        expect(isChildPath("/parent/child", "/parent")).toBe(true)
    })

    it("should return true if the potential child is a nested child of the potential parent", () => {
        expect(isChildPath("/parent/child/grandchild", "/parent")).toBe(true)
    })

    it("should handle trailing slashes correctly", () => {
        expect(isChildPath("/parent/child/grandchild", "/parent/")).toBe(true)
    })

    it("should handle paths with single dot segments", () => {
        expect(isChildPath("/parent/./child", "/parent")).toBe(true)
    })

    it("should handle paths with double dot segments", () => {
        expect(isChildPath("/a/b/c/../../b/c", "/a/b")).toBe(true)
    })
})
