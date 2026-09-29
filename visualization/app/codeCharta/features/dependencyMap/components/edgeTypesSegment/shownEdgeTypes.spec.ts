import { DEPENDENCY_EDGE_TYPES, DependencyEdgeType } from "../../../../model/dependencyGraph.model"
import { invertedEdgeTypes, nameOfShownEdgeTypes, withAllEdgeTypes, withoutEdgeTypes } from "./shownEdgeTypes"

describe("shownEdgeTypes", () => {
    describe("nameOfShownEdgeTypes", () => {
        it.each([
            [DEPENDENCY_EDGE_TYPES, DEPENDENCY_EDGE_TYPES, "All"],
            [[], DEPENDENCY_EDGE_TYPES, "None"],
            [["feedbackLeafLevel", "cyclic"], DEPENDENCY_EDGE_TYPES, "In a cycle, Points upward and closes a cycle"],
            [["regular"], ["regular"], "All"],
            [["cyclic"], ["regular"], "None"]
        ] as const)("should name the shown types %j of the carried %j as %s", (shown, carried, expected) => {
            // Arrange
            const carriedTypes: readonly DependencyEdgeType[] = carried

            // Act
            const name = nameOfShownEdgeTypes(shown, carriedTypes)

            // Assert
            expect(name).toBe(expected)
        })
    })

    describe("withAllEdgeTypes", () => {
        it("should add the types in the order of the edge colours", () => {
            // Arrange
            const shown: DependencyEdgeType[] = ["feedbackLeafLevel"]

            // Act
            const types = withAllEdgeTypes(shown, ["regular"])

            // Assert
            expect(types).toEqual(["regular", "feedbackLeafLevel"])
        })
    })

    describe("withoutEdgeTypes", () => {
        it("should remove the types and keep the others", () => {
            // Arrange
            const removed: DependencyEdgeType[] = ["regular", "cyclic"]

            // Act
            const types = withoutEdgeTypes(DEPENDENCY_EDGE_TYPES, removed)

            // Assert
            expect(types).toEqual(["feedbackContainerLevel", "feedbackLeafLevel"])
        })
    })

    describe("invertedEdgeTypes", () => {
        it("should flip the carried types and leave the others as they were", () => {
            // Arrange
            const shown: DependencyEdgeType[] = ["regular", "cyclic"]

            // Act
            const types = invertedEdgeTypes(shown, ["regular"])

            // Assert
            expect(types).toEqual(["cyclic"])
        })
    })
})
