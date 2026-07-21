import { formatCompactNumber } from "./formatCompactNumber"

describe("formatCompactNumber", () => {
    it("should return small numbers as-is", () => {
        expect(formatCompactNumber(0)).toBe("0")
        expect(formatCompactNumber(47)).toBe("47")
        expect(formatCompactNumber(999)).toBe("999")
    })

    it("should format thousands with K suffix", () => {
        expect(formatCompactNumber(1000)).toBe("1K")
        expect(formatCompactNumber(1500)).toBe("1.5K")
        expect(formatCompactNumber(10000)).toBe("10K")
        expect(formatCompactNumber(999999)).toBe("1M")
    })

    it("should format millions with M suffix", () => {
        expect(formatCompactNumber(1_000_000)).toBe("1M")
        expect(formatCompactNumber(2_500_000)).toBe("2.5M")
    })

    it("should return empty string for null and undefined", () => {
        expect(formatCompactNumber(null)).toBe("")
        expect(formatCompactNumber(undefined)).toBe("")
    })
})
