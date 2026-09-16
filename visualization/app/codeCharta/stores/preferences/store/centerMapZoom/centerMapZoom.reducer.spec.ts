import { setCenterMapZoom } from "./centerMapZoom.actions"
import { centerMapZoom, defaultCenterMapZoom } from "./centerMapZoom.reducer"

describe("centerMapZoom", () => {
    it("should set a new centerMapZoom", () => {
        // Arrange
        const newZoom = 165

        // Act
        const result = centerMapZoom(defaultCenterMapZoom, setCenterMapZoom({ value: newZoom }))

        // Assert
        expect(result).toBe(newZoom)
    })

    it("should reset to the default when the value is undefined", () => {
        // Arrange
        const previousZoom = 165

        // Act
        const result = centerMapZoom(previousZoom, setCenterMapZoom({ value: undefined }))

        // Assert
        expect(result).toBe(defaultCenterMapZoom)
    })
})
