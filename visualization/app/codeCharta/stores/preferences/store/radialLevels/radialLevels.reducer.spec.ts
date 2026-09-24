import { setRadialLevels } from "./radialLevels.actions"
import { defaultRadialLevels, radialLevels } from "./radialLevels.reducer"

describe("radialLevels", () => {
    it("should set a new radialLevels", () => {
        // Arrange
        const newValue = 7

        // Act
        const result = radialLevels(defaultRadialLevels, setRadialLevels({ value: newValue }))

        // Assert
        expect(result).toBe(newValue)
    })

    it("should reset to the default when the value is undefined", () => {
        // Arrange
        const previousValue = 7

        // Act
        const result = radialLevels(previousValue, setRadialLevels({ value: undefined }))

        // Assert
        expect(result).toBe(defaultRadialLevels)
    })
})
