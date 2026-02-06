import { _mapColors2pictogramColors } from "./pictogramBackground.selector"

describe("pictogramBackgroundSelector", () => {
    it("should return a 50/50 linear-gradient", () => {
        // Arrange
        const mapColors = { positiveDelta: "#000000", negativeDelta: "#ffffff" }

        // Act
        const result = _mapColors2pictogramColors(mapColors)

        // Assert
        expect(result).toBe("linear-gradient(#000000 50%, #ffffff 50%)")
    })
})
