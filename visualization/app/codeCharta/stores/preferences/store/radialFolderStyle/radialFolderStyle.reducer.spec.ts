import { RadialFolderStyle } from "../../../../model/codeCharta.model"
import { setRadialFolderStyle } from "./radialFolderStyle.actions"
import { defaultRadialFolderStyle, radialFolderStyle } from "./radialFolderStyle.reducer"

describe("radialFolderStyle", () => {
    it("should set a new radialFolderStyle", () => {
        // Arrange
        const newValue = RadialFolderStyle.Neutral

        // Act
        const result = radialFolderStyle(defaultRadialFolderStyle, setRadialFolderStyle({ value: newValue }))

        // Assert
        expect(result).toBe(newValue)
    })

    it("should reset to the default when the value is undefined", () => {
        // Arrange
        const previousValue = RadialFolderStyle.Neutral

        // Act
        const result = radialFolderStyle(previousValue, setRadialFolderStyle({ value: undefined }))

        // Assert
        expect(result).toBe(defaultRadialFolderStyle)
    })
})
