import { searchMatcher } from "./dependencyGraphScene"

describe("searchMatcher", () => {
    it("should count every box as found while no search is on", () => {
        // Arrange
        const noSearch = null

        // Act
        const isFound = searchMatcher(noSearch)

        // Assert
        expect(isFound("/root/a.ts")).toBe(true)
    })

    it("should find a box the search found, and the folders holding it", () => {
        // Arrange
        const searchedPaths = new Set(["/root/app/a.ts"])

        // Act
        const isFound = searchMatcher(searchedPaths)

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
        // Arrange
        const searchedPaths = new Set(["/root/app"])

        // Act
        const isFound = searchMatcher(searchedPaths)

        // Assert
        expect(["/root/app/deep/a.ts", "/root/application.ts"].map(isFound)).toEqual([true, false])
    })
})
