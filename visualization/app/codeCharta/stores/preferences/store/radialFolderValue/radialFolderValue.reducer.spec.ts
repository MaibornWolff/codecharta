import { RadialFolderValue } from "../../../../model/codeCharta.model"
import { setRadialFolderValue } from "./radialFolderValue.actions"
import { defaultRadialFolderValue, radialFolderValue } from "./radialFolderValue.reducer"

describe("radialFolderValue", () => {
    it("should set a new radialFolderValue", () => {
        // Arrange
        const newValue = RadialFolderValue.Median

        // Act
        const result = radialFolderValue(defaultRadialFolderValue, setRadialFolderValue({ value: newValue }))

        // Assert
        expect(result).toBe(newValue)
    })

    it("should reset to the default when the value is undefined", () => {
        // Arrange
        const previousValue = RadialFolderValue.Median

        // Act
        const result = radialFolderValue(previousValue, setRadialFolderValue({ value: undefined }))

        // Assert
        expect(result).toBe(defaultRadialFolderValue)
    })
})
