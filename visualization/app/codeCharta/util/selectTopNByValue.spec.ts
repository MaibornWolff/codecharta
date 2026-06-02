import { selectTopNByValue } from "./selectTopNByValue"

describe("selectTopNByValue", () => {
    const getValue = (item: { v: number }) => item.v

    it("should return the n highest items in descending order", () => {
        // Arrange
        const items = [{ v: 4 }, { v: 223 }, { v: 17 }, { v: 1 }, { v: 99 }]

        // Act
        const result = selectTopNByValue(items, getValue, 3)

        // Assert
        expect(result.map(getValue)).toEqual([223, 99, 17])
    })

    it("should match a full sort+slice for the same input", () => {
        // Arrange
        const items = Array.from({ length: 50 }, (_, i) => ({ v: (i * 37) % 50 }))
        const expected = [...items]
            .sort((a, b) => b.v - a.v)
            .slice(0, 7)
            .map(getValue)

        // Act
        const result = selectTopNByValue(items, getValue, 7).map(getValue)

        // Assert
        expect(result).toEqual(expected)
    })

    it("should return all items sorted when n exceeds the length", () => {
        // Arrange
        const items = [{ v: 2 }, { v: 5 }, { v: 1 }]

        // Act
        const result = selectTopNByValue(items, getValue, 10)

        // Assert
        expect(result.map(getValue)).toEqual([5, 2, 1])
    })

    it("should return an empty array when n is zero or negative", () => {
        // Arrange
        const items = [{ v: 1 }, { v: 2 }]

        // Act & Assert
        expect(selectTopNByValue(items, getValue, 0)).toEqual([])
        expect(selectTopNByValue(items, getValue, -3)).toEqual([])
    })

    it("should keep the original relative order for tied values", () => {
        // Arrange
        const a = { v: 5, id: "a" }
        const b = { v: 5, id: "b" }
        const c = { v: 1, id: "c" }

        // Act
        const result = selectTopNByValue([a, b, c], item => item.v, 2)

        // Assert
        expect(result.map(item => item.id)).toEqual(["a", "b"])
    })
})
