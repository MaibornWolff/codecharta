import { loadWordCloudMaskImage, WORD_CLOUD_M_MASK_DATA_URI } from "./wordCloudMask"

describe("wordCloudMask", () => {
    const decodedSvg = decodeURIComponent(WORD_CLOUD_M_MASK_DATA_URI.replace("data:image/svg+xml,", ""))

    it("should expose the mask as an inline svg data uri", () => {
        // Assert
        expect(WORD_CLOUD_M_MASK_DATA_URI.startsWith("data:image/svg+xml,")).toBe(true)
        expect(decodedSvg).toContain("<svg")
    })

    it("should contain only the two M arch paths, not the maibornwolff wordmark", () => {
        // Assert — the two arches are kept...
        const paths = decodedSvg.match(/<path/g) ?? []
        expect(paths).toHaveLength(2)
        expect(decodedSvg).toContain("M81.9,20.3")
        expect(decodedSvg).toContain("M122.7,20.3")
        // ...and the wordmark path (which started at M11.3,79) is gone
        expect(decodedSvg).not.toContain("logo__text")
        expect(decodedSvg).not.toContain("M11.3,79")
    })

    it("should crop the viewBox to the M so it fills the mask instead of sitting in the logo lockup", () => {
        // Assert
        expect(decodedSvg).toContain('viewBox="58.7 0 64 56.3"')
    })

    it("should reject loading when the environment cannot rasterize images", async () => {
        // Arrange — simulate a DOM without Image (e.g. a headless context)
        const originalImage = globalThis.Image
        ;(globalThis as { Image?: unknown }).Image = undefined

        // Act & Assert
        await expect(loadWordCloudMaskImage()).rejects.toThrow("Image is not available")

        // Cleanup
        globalThis.Image = originalImage
    })
})
