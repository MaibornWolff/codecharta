import { formatShare } from "./formatShare"

describe("formatShare", () => {
    it("should render a whole share as a full percentage", () => {
        // Act & Assert
        expect(formatShare(1)).toBe("100%")
    })

    it("should round a share to whole percent", () => {
        // Act & Assert
        expect(formatShare(0.126)).toBe("13%")
    })

    it("should keep a tiny share visible instead of rounding it away", () => {
        // Act & Assert
        expect(formatShare(0.004)).toBe("<1%")
    })

    it("should render an absent share as zero", () => {
        // Act & Assert
        expect(formatShare(0)).toBe("0%")
    })
})
