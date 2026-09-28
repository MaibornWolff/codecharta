import { dependencyEdgeTypeOf, dependencyWeightOf } from "./dependencyEdge"

describe("dependency edge", () => {
    describe("dependencyEdgeTypeOf", () => {
        it.each([
            [false, false, "regular"],
            [true, false, "cyclic"],
            [false, true, "feedbackContainerLevel"],
            [true, true, "feedbackLeafLevel"]
        ])("should derive the type when isCyclic is %s and isPointingUpwards is %s", (isCyclic, isPointingUpwards, expected) => {
            // Arrange
            const edge = { isCyclic, isPointingUpwards }

            // Act
            const type = dependencyEdgeTypeOf(edge)

            // Assert
            expect(type).toBe(expected)
        })

        it("should read absent flags as false", () => {
            // Arrange
            const edge = {}

            // Act
            const type = dependencyEdgeTypeOf(edge)

            // Assert
            expect(type).toBe("regular")
        })
    })

    describe("dependencyWeightOf", () => {
        it("should read the dependencies attribute", () => {
            // Arrange
            const edge = { attributes: { dependencies: 4 } }

            // Act
            const weight = dependencyWeightOf(edge)

            // Assert
            expect(weight).toBe(4)
        })

        it("should count an edge without the attribute as one dependency", () => {
            // Arrange
            const edge = { attributes: {} }

            // Act
            const weight = dependencyWeightOf(edge)

            // Assert
            expect(weight).toBe(1)
        })
    })
})
