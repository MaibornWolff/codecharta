import { DEPENDENCY_EDGE_TYPES } from "../../../../lenses/dependency/dependencyLens.facade"
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
            // Act
            const name = nameOfShownEdgeTypes(shown, carried)

            // Assert
            expect(name).toBe(expected)
        })
    })

    describe("withAllEdgeTypes", () => {
        it("should add the types in the order of the edge colours", () => {
            // Act
            const types = withAllEdgeTypes(["feedbackLeafLevel"], ["regular"])

            // Assert
            expect(types).toEqual(["regular", "feedbackLeafLevel"])
        })
    })

    describe("withoutEdgeTypes", () => {
        it("should remove the types and keep the others", () => {
            // Act
            const types = withoutEdgeTypes(DEPENDENCY_EDGE_TYPES, ["regular", "cyclic"])

            // Assert
            expect(types).toEqual(["feedbackContainerLevel", "feedbackLeafLevel"])
        })
    })

    describe("invertedEdgeTypes", () => {
        it("should flip the carried types and leave the others as they were", () => {
            // Act
            const types = invertedEdgeTypes(["regular", "cyclic"], ["regular"])

            // Assert
            expect(types).toEqual(["cyclic"])
        })
    })
})
