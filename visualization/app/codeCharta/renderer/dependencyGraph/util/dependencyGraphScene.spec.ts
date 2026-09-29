import { searchMatcher } from "./dependencyGraphScene"

describe("searchMatcher", () => {
    it("should count every box as found while no search is on", () => {
        // Act
        const isFound = searchMatcher(null)

        // Assert
        expect(isFound("/root/a.ts")).toBe(true)
    })

    it("should find a box the search found, and the folders holding it", () => {
        // Act
        const isFound = searchMatcher(new Set(["/root/app/a.ts"]))

        // Assert
        expect(["/root", "/root/app", "/root/app/a.ts", "/root/app/b.ts", "/root/lib"].map(isFound)).toEqual([
            true,
            true,
            true,
            false,
            false
        ])
    })

    it("should find every box inside a folder the search found", () => {
        // Act
        const isFound = searchMatcher(new Set(["/root/app"]))

        // Assert
        expect(["/root/app/deep/a.ts", "/root/application.ts"].map(isFound)).toEqual([true, false])
    })
})
