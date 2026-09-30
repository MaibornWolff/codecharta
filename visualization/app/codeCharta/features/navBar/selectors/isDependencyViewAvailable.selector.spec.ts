import { isDependencyViewAvailableSelector } from "./isDependencyViewAvailable.selector"

describe("isDependencyViewAvailableSelector", () => {
    it("should offer the dependency view when it is switched on and the files carry dependency levels", () => {
        // Arrange
        const isEnabled = true
        const hasDependencyData = true

        // Act
        const result = isDependencyViewAvailableSelector.projector(isEnabled, hasDependencyData)

        // Assert
        expect(result).toBe(true)
    })

    it("should not offer the dependency view while it is switched off, even for files with dependency levels", () => {
        // Arrange
        const isEnabled = false
        const hasDependencyData = true

        // Act
        const result = isDependencyViewAvailableSelector.projector(isEnabled, hasDependencyData)

        // Assert
        expect(result).toBe(false)
    })

    it("should not offer the dependency view for files without dependency levels", () => {
        // Arrange
        const isEnabled = true
        const hasDependencyData = false

        // Act
        const result = isDependencyViewAvailableSelector.projector(isEnabled, hasDependencyData)

        // Assert
        expect(result).toBe(false)
    })
})
