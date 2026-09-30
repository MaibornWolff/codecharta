import { setDependencyViewEnabled } from "./dependencyViewEnabled.actions"
import { defaultDependencyViewEnabled, dependencyViewEnabled } from "./dependencyViewEnabled.reducer"

describe("dependencyViewEnabled", () => {
    it("should keep the dependency view switched off by default", () => {
        // Arrange
        const initialAction = { type: "@ngrx/store/init" }

        // Act
        const result = dependencyViewEnabled(undefined, initialAction)

        // Assert
        expect(result).toBe(defaultDependencyViewEnabled)
        expect(result).toBe(false)
    })

    it("should set new dependencyViewEnabled", () => {
        // Arrange
        const action = setDependencyViewEnabled({ value: true })

        // Act
        const result = dependencyViewEnabled(false, action)

        // Assert
        expect(result).toBe(true)
    })
})
