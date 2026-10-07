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

    it("should reset to the defaults when the value is undefined", () => {
        // Arrange
        const changed = { ...defaultDependencyGraphSettings, isAnchoredAtSideMiddle: true }

        // Act
        const result = dependencyGraph(changed, setDependencyGraphSettings({ value: undefined }))

        // Assert
        expect(result).toBe(defaultDependencyGraphSettings)
    })
})
