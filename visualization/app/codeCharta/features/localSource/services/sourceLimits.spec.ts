import { isTooLargeToShow, MAX_SHOWN_SIZE, reasonToLeaveUncoloured, sizeOf } from "./sourceLimits"

const MEGABYTE = 1024 * 1024

describe("sourceLimits", () => {
    it("should name sizes in megabytes, with one decimal only where it adds something", () => {
        // Act
        const sizes = [sizeOf(5 * MEGABYTE), sizeOf(6.24 * MEGABYTE), sizeOf(0.5 * MEGABYTE)]

        // Assert
        expect(sizes).toEqual(["5 MB", "6.2 MB", "0.5 MB"])
        expect(MAX_SHOWN_SIZE).toBe("5 MB")
    })

    it("should show files up to 5 MB and no larger ones", () => {
        // Act
        const answers = [isTooLargeToShow(5 * MEGABYTE), isTooLargeToShow(5 * MEGABYTE + 1)]

        // Assert
        expect(answers).toEqual([false, true])
    })

    it("should colour a file up to 1 MB whose lines stay readable", () => {
        // Act
        const reason = reasonToLeaveUncoloured("val x = 1\n".repeat(1000), MEGABYTE)

        // Assert
        expect(reason).toBeNull()
    })

    it("should leave a file larger than 1 MB plain", () => {
        // Act
        const reason = reasonToLeaveUncoloured("val x = 1", MEGABYTE + 1)

        // Assert
        expect(reason).toBe("larger than 1 MB")
    })

    it("should leave a file with a line longer than 20,000 characters plain, as minified code has", () => {
        // Arrange
        const minified = `${"a".repeat(20_001)}\nshort line`

        // Act
        const reason = reasonToLeaveUncoloured(minified, minified.length)

        // Assert
        expect(reason).toBe("has lines longer than 20,000 characters")
    })
})
