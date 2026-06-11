import { getFileCount } from "./getFileCount"

describe("getFileCount", () => {
    it("should return undefined when no node is given", () => {
        // Arrange & Act
        const result = getFileCount(undefined)

        // Assert
        expect(result).toBeUndefined()
    })

    it("should derive the total file count from the unary attribute", () => {
        // Arrange
        const node = { attributes: { unary: 42 }, fileCount: { added: 2, removed: 1, changed: 3 } }

        // Act
        const result = getFileCount(node)

        // Assert
        expect(result).toEqual({ all: 42, added: 2, removed: 1, changed: 3 })
    })

    it("should fall back to zero counts when file count information is missing", () => {
        // Arrange
        const node = { attributes: {} }

        // Act
        const result = getFileCount(node)

        // Assert
        expect(result).toEqual({ all: 0, added: 0, removed: 0, changed: 0 })
    })
})
