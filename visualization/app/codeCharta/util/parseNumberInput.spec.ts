import { parseNumberInput } from "./parseNumberInput"

describe("parseNumberInput", () => {
    it("should get value", () => {
        // Arrange
        const fakeEvent = { target: { value: 42 } } as unknown as InputEvent

        // Act
        const result = parseNumberInput(fakeEvent, 0, 100)

        // Assert
        expect(result).toBe(42)
    })

    it("should return min value in case of too small entered valued", () => {
        // Arrange
        const fakeEvent = { target: { value: 1 } } as unknown as InputEvent

        // Act
        const result = parseNumberInput(fakeEvent, 2, 100)

        // Assert
        expect(result).toBe(2)
    })

    it("should return max value in case of too large entered valued", () => {
        // Arrange
        const fakeEvent = { target: { value: 9999 } } as unknown as InputEvent

        // Act
        const result = parseNumberInput(fakeEvent, 0, 9000)

        // Assert
        expect(result).toBe(9000)
    })

    it("should return NaN for non-numeric input", () => {
        // Arrange
        const fakeEvent = { target: { value: "abc" } } as unknown as InputEvent

        // Act
        const result = parseNumberInput(fakeEvent, 0, 100)

        // Assert
        expect(result).toBeNaN()
    })

    it("should not write the clamped value back into the input while typing", () => {
        // Arrange
        const target = { value: "9999" }
        const fakeEvent = { target } as unknown as InputEvent

        // Act
        const result = parseNumberInput(fakeEvent, 0, 9000)

        // Assert
        expect(result).toBe(9000)
        expect(target.value).toBe("9999")
    })

    it("should preserve decimals for in-range input", () => {
        // Arrange
        const fakeEvent = { target: { value: "1.5" } } as unknown as InputEvent

        // Act
        const result = parseNumberInput(fakeEvent, 0, 100)

        // Assert
        expect(result).toBe(1.5)
    })

    it("should clamp a decimal value that exceeds max", () => {
        // Arrange
        const fakeEvent = { target: { value: "2.7" } } as unknown as InputEvent

        // Act
        const result = parseNumberInput(fakeEvent, 0, 2)

        // Assert
        expect(result).toBe(2)
    })

    it("should round fractional input to an integer when the round option is set", () => {
        // Arrange
        const fakeEvent = { target: { value: "2.7" } } as unknown as InputEvent

        // Act
        const result = parseNumberInput(fakeEvent, 0, 100, { round: true })

        // Assert
        expect(result).toBe(3)
    })

    it("should clamp after rounding when the rounded value is out of range", () => {
        // Arrange
        const fakeEvent = { target: { value: "100.4" } } as unknown as InputEvent

        // Act
        const result = parseNumberInput(fakeEvent, 0, 100, { round: true })

        // Assert
        expect(result).toBe(100)
    })
})
