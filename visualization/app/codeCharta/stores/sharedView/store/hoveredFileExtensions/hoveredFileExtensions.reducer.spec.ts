import { setHoveredFileExtensions } from "./hoveredFileExtensions.actions"
import { hoveredFileExtensions } from "./hoveredFileExtensions.reducer"

describe("hoveredFileExtensions", () => {
    it("should set the hovered file extensions", () => {
        // Act
        const result = hoveredFileExtensions([], setHoveredFileExtensions({ value: ["ts", "json"] }))

        // Assert
        expect(result).toEqual(["ts", "json"])
    })
})
