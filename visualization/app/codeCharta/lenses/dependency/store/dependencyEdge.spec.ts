import { DEPENDENCY_EDGE_TYPES } from "../../../model/dependencyGraph.model"
import { dependencyEdgeTypeOf, edgeTypesCarriedBy, isDependencyEdgeMetric } from "./dependencyEdge"

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

    describe("isDependencyEdgeMetric", () => {
        it("should tell the dependencies metric from the other edge metrics", () => {
            // Act
            const answers = ["dependencies", "temporal_coupling", null].map(isDependencyEdgeMetric)

            // Assert
            expect(answers).toEqual([true, false, false])
        })
    })

    describe("edgeTypesCarriedBy", () => {
        it("should carry every type for dependencies and only regular edges for another metric", () => {
            // Act
            const forDependencies = edgeTypesCarriedBy("dependencies")
            const forCoupling = edgeTypesCarriedBy("temporal_coupling")

            // Assert
            expect(forDependencies).toEqual(DEPENDENCY_EDGE_TYPES)
            expect(forCoupling).toEqual(["regular"])
        })
    })
})
