import { setRadialFolderTint } from "./radialFolderTint.actions"
import { defaultRadialFolderTint, radialFolderTint } from "./radialFolderTint.reducer"

describe("radialFolderTint", () => {
    it("should set a new radialFolderTint", () => {
        // Arrange
        const newValue = 0.8

        // Act
        const result = radialFolderTint(defaultRadialFolderTint, setRadialFolderTint({ value: newValue }))

        // Assert
        expect(result).toBe(newValue)
    })

    it("should reset to the default when the value is undefined", () => {
        // Arrange
        const previousValue = 0.8

        // Act
        const result = radialFolderTint(previousValue, setRadialFolderTint({ value: undefined }))

        // Assert
        expect(result).toBe(defaultRadialFolderTint)
    })
})
