import { histogramBins } from "./histogramBins"

describe("histogramBins", () => {
    it("should return 12 zeros when values is empty", () => {
        // Arrange
        const values: number[] = []

        // Act
        const result = histogramBins(values)

        // Assert
        expect(result).toHaveLength(12)
        expect(result.every(height => height === 0)).toBe(true)
    })

    it("should return 12 zeros when all values are equal", () => {
        // Arrange
        const values = [5, 5, 5, 5, 5]

        // Act
        const result = histogramBins(values)

        // Assert
        expect(result).toHaveLength(12)
        expect(result.every(height => height === 0)).toBe(true)
    })

    it("should return 12 zeros when only NaN values are present", () => {
        // Arrange
        const values = [Number.NaN, Number.NaN]

        // Act
        const result = histogramBins(values)

        // Assert
        expect(result).toHaveLength(12)
        expect(result.every(height => height === 0)).toBe(true)
    })

    it("should distribute linear 0..11 input into 12 bins with √-scaled heights", () => {
        // Arrange
        const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

        // Act
        const result = histogramBins(values)

        // Assert
        expect(result).toHaveLength(12)
        // Each bin should have exactly one value, all heights equal to 1
        expect(result.every(height => height === 1)).toBe(true)
    })

    it("should make a single outlier dominate the max bin", () => {
        // Arrange
        const values = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100]

        // Act
        const result = histogramBins(values)

        // Assert
        expect(result).toHaveLength(12)
        // First bin holds 10 zeros, last bin holds 1 outlier
        // max count is 10, so first bin = sqrt(10)/sqrt(10) = 1
        // last bin = sqrt(1)/sqrt(10) ≈ 0.316
        expect(result[0]).toBeCloseTo(1)
        expect(result[result.length - 1]).toBeCloseTo(Math.sqrt(1) / Math.sqrt(10))
        // Middle bins should be 0
        for (let i = 1; i < result.length - 1; i++) {
            expect(result[i]).toBe(0)
        }
    })

    it("should respect a custom binCount", () => {
        // Arrange
        const values = [0, 1, 2, 3]

        // Act
        const result = histogramBins(values, 4)

        // Assert
        expect(result).toHaveLength(4)
    })

    it("should bin over an explicit range when provided instead of the values' own min/max", () => {
        // Arrange: values that only cover the low end of a wider global range
        const values = [1, 2, 3]

        // Act: bin over the global range [0, 12] rather than the values' own [1, 3]
        const result = histogramBins(values, 12, { min: 0, max: 12 })

        // Assert: each value lands in its own low bin; the upper bins stay empty
        expect(result).toHaveLength(12)
        expect(result[0]).toBe(0)
        expect(result[1]).toBe(1)
        expect(result[2]).toBe(1)
        expect(result[3]).toBe(1)
        for (let i = 4; i < 12; i++) {
            expect(result[i]).toBe(0)
        }
    })

    it("should clamp values below the explicit range minimum into the first bin", () => {
        // Arrange
        const values = [-5, 5]

        // Act
        const result = histogramBins(values, 10, { min: 0, max: 10 })

        // Assert: the out-of-range -5 is clamped into bin 0, 5 lands in bin 5
        expect(result[0]).toBe(1)
        expect(result[5]).toBe(1)
    })

    it("should ignore non-finite values when computing bins", () => {
        // Arrange
        const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, Number.NaN, Number.POSITIVE_INFINITY]

        // Act
        const result = histogramBins(values)

        // Assert
        expect(result).toHaveLength(12)
        expect(result.every(height => height === 1)).toBe(true)
    })
})
