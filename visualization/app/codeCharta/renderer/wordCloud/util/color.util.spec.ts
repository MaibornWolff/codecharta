import { getWordCloudColors, interpolateColor } from "./color.util"

describe("color.util", () => {
    describe("interpolateColor", () => {
        it("should return the start color at factor 0", () => {
            expect(interpolateColor("#000000", "#ffffff", 0)).toBe("#000000")
        })

        it("should return the end color at factor 1", () => {
            expect(interpolateColor("#000000", "#ffffff", 1)).toBe("#ffffff")
        })

        it("should return the midpoint at factor 0.5", () => {
            expect(interpolateColor("#000000", "#ffffff", 0.5)).toBe("#808080")
        })

        it("should interpolate the word cloud gradient endpoints", () => {
            expect(interpolateColor("#e6007e", "#0030ff", 0.5)).toBe("#7318bf")
        })

        it("should clamp a factor above 1 to the end color", () => {
            expect(interpolateColor("#000000", "#ffffff", 5)).toBe("#ffffff")
        })

        it("should clamp a negative factor to the start color", () => {
            expect(interpolateColor("#102030", "#ffffff", -2)).toBe("#102030")
        })

        it("should fall back to the default start color for a malformed start color", () => {
            expect(interpolateColor("not-a-color", "#ffffff", 0)).toBe("#e6007e")
        })
    })

    describe("getWordCloudColors", () => {
        afterEach(() => {
            document.documentElement.style.removeProperty("--wordCloudColorStart")
            document.documentElement.style.removeProperty("--wordCloudColorEnd")
        })

        it("should default to the word cloud brand gradient", () => {
            // Act
            const [start, end] = getWordCloudColors()

            // Assert
            expect(start).toBe("#e6007e")
            expect(end).toBe("#0030ff")
        })

        it("should honor hex overrides from CSS custom properties", () => {
            // Arrange
            document.documentElement.style.setProperty("--wordCloudColorStart", "#123456")
            document.documentElement.style.setProperty("--wordCloudColorEnd", "#abcdef")

            // Act
            const [start, end] = getWordCloudColors()

            // Assert
            expect(start).toBe("#123456")
            expect(end).toBe("#abcdef")
        })

        it("should ignore a non-hex override and keep the default color", () => {
            // Arrange
            document.documentElement.style.setProperty("--wordCloudColorStart", "rgb(1,2,3)")

            // Act
            const [start] = getWordCloudColors()

            // Assert
            expect(start).toBe("#e6007e")
        })
    })
})
