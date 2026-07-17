import { setLabelsPerMap } from "./labelsPerMap.actions"
import { labelsPerMap } from "./labelsPerMap.reducer"

describe("labelsPerMap", () => {
    it("should set new labelsPerMap", () => {
        // Arrange
        const initialValue = false

        // Act
        const result = labelsPerMap(initialValue, setLabelsPerMap({ value: true }))

        // Assert
        expect(result).toBe(true)
    })
})
