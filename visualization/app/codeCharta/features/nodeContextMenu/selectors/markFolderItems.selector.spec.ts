import { _getCurrentMarkColor, _getMarkFolderItems } from "./markFolderItems.selector"

describe("markFolderItemsSelector's _getMarkFolderItems", () => {
    it("should return all colors as unmarked if no node is given", () => {
        // Arrange
        const markingColors = ["#000000", "#ffffff"]

        // Act
        const markFolderItems = _getMarkFolderItems(null, markingColors, [])

        // Assert
        expect(markFolderItems).toEqual([
            { color: "#000000", isMarked: false },
            { color: "#ffffff", isMarked: false }
        ])
    })

    it("should recognize a marked folder", () => {
        // Arrange
        const markingColors = ["#000000", "#ffffff"]
        const markedPackages = [{ color: "#000000", path: "/root" }]

        // Act
        const markFolderItems = _getMarkFolderItems({ path: "/root" }, markingColors, markedPackages)

        // Assert
        expect(markFolderItems).toEqual([
            { color: "#000000", isMarked: true },
            { color: "#ffffff", isMarked: false }
        ])
    })
})

describe("markFolderItemsSelector's _getCurrentMarkColor", () => {
    it("should return null if no node is given", () => {
        // Arrange & Act & Assert
        expect(_getCurrentMarkColor(null, [{ color: "#123456", path: "/root" }])).toBe(null)
    })

    it("should return null when the node is not marked", () => {
        // Arrange & Act & Assert
        expect(_getCurrentMarkColor({ path: "/root/other" }, [])).toBe(null)
    })

    it("should return the color of the marked node or its parent", () => {
        // Arrange
        const markedPackages = [{ color: "#123456", path: "/root" }]

        // Act & Assert
        expect(_getCurrentMarkColor({ path: "/root" }, markedPackages)).toBe("#123456")
        expect(_getCurrentMarkColor({ path: "/root/child" }, markedPackages)).toBe("#123456")
    })
})
