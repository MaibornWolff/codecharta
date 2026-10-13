import { setDependencyGraphSettings } from "./dependencyGraph.actions"
import { defaultDependencyGraphSettings, dependencyGraph } from "./dependencyGraph.reducer"

describe("dependencyGraph", () => {
    it("should change the given settings and keep the others", () => {
        // Arrange
        const action = setDependencyGraphSettings({ value: { edgeStyle: "aside" } })

        // Act
        const result = dependencyGraph(defaultDependencyGraphSettings, action)

        // Assert
        expect(result).toEqual({ ...defaultDependencyGraphSettings, edgeStyle: "aside" })
    })

    it("should show the edges in cycles and those pointing upward at first, not the plain dependencies", () => {
        // Arrange
        const beforeAnyChoice = undefined

        // Act
        const result = dependencyGraph(beforeAnyChoice, { type: "@ngrx/store/init" })

        // Assert
        expect(result.shownEdgeTypes).toEqual(["cyclic", "feedbackContainerLevel", "feedbackLeafLevel"])
    })

    it("should reset to the defaults when the value is undefined", () => {
        // Arrange
        const changed = { ...defaultDependencyGraphSettings, isAnchoredAtSideMiddle: true }

        // Act
        const result = dependencyGraph(changed, setDependencyGraphSettings({ value: undefined }))

        // Assert
        expect(result).toBe(defaultDependencyGraphSettings)
    })
})
