import { addToGroup, maxOf, minOf } from "./collections"

const MORE_VALUES_THAN_A_CALL_TAKES_AS_ARGUMENTS = 200_000

describe("collections", () => {
    describe("addToGroup", () => {
        it("should start a group for a new key and add to the same group for a known one", () => {
            // Arrange
            const groups = new Map<string, number[]>()

            // Act
            addToGroup(groups, "even", 2)
            addToGroup(groups, "odd", 1)
            addToGroup(groups, "even", 4)

            // Assert
            expect([...groups]).toEqual([
                ["even", [2, 4]],
                ["odd", [1]]
            ])
        })

        it("should add to the group already in the map instead of replacing it", () => {
            // Arrange
            const evens = [2]
            const groups = new Map([["even", evens]])

            // Act
            addToGroup(groups, "even", 4)

            // Assert
            expect(groups.get("even")).toBe(evens)
            expect(evens).toEqual([2, 4])
        })
    })

    describe("minOf and maxOf", () => {
        it("should find the smallest and the largest value", () => {
            // Arrange
            const values = [3, -7, 12, 0]

            // Act
            const extremes = [minOf(values), maxOf(values)]

            // Assert
            expect(extremes).toEqual([-7, 12])
        })

        it("should answer like Math.min and Math.max for no values", () => {
            // Arrange
            const values: number[] = []

            // Act
            const extremes = [minOf(values), maxOf(values)]

            // Assert
            expect(extremes).toEqual([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
        })

        it("should handle more values than a function call takes as arguments", () => {
            // Arrange
            const values = Array.from({ length: MORE_VALUES_THAN_A_CALL_TAKES_AS_ARGUMENTS }, (_, index) => index)

            // Act
            const extremes = [minOf(values), maxOf(values)]

            // Assert
            expect(extremes).toEqual([0, MORE_VALUES_THAN_A_CALL_TAKES_AS_ARGUMENTS - 1])
        })
    })
})
