import { loadMaskImage, WORD_CLOUD_M_MASK_DATA_URI } from "./wordCloudMask"

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
        expect(decodedSvg).not.toContain("logo__text")
        expect(decodedSvg).not.toContain("M11.3,79")
    })

    it("should crop the viewBox to the M so it fills the mask instead of sitting in the logo lockup", () => {
        // Assert
        expect(decodedSvg).toContain('viewBox="58.7 0 64 56.3"')
    })

    it("should resolve with the image once the shape has been rasterized", async () => {
        // Arrange — JSDOM never decodes an image, so the load is driven by hand
        const originalImage = globalThis.Image
        let loadedImage: { src?: string; onload?: () => void; onerror?: () => void } = {}
        ;(globalThis as { Image?: unknown }).Image = class {
            src?: string
            onload?: () => void
            onerror?: () => void
            constructor() {
                loadedImage = this
            }
        }

        // Act
        const image = loadMaskImage(WORD_CLOUD_M_MASK_DATA_URI)
        loadedImage.onload?.()

        // Assert
        await expect(image).resolves.toBe(loadedImage)
        expect(loadedImage.src).toBe(WORD_CLOUD_M_MASK_DATA_URI)
        globalThis.Image = originalImage
    })

    it("should reject a shape the browser could not rasterize", async () => {
        // Arrange
        const originalImage = globalThis.Image
        let loadedImage: { onerror?: () => void } = {}
        ;(globalThis as { Image?: unknown }).Image = class {
            src?: string
            onload?: () => void
            onerror?: () => void
            constructor() {
                loadedImage = this
            }
        }

        // Act
        const image = loadMaskImage("data:image/svg+xml,broken")
        loadedImage.onerror?.()

        // Assert
        await expect(image).rejects.toThrow("Failed to load the word-cloud mask image")
        globalThis.Image = originalImage
    })

    it("should reject loading when the environment cannot rasterize images", async () => {
        // Arrange — simulate a DOM without Image (e.g. a headless context)
        const originalImage = globalThis.Image
        ;(globalThis as { Image?: unknown }).Image = undefined

        // Act & Assert
        await expect(loadMaskImage(WORD_CLOUD_M_MASK_DATA_URI)).rejects.toThrow("Image is not available")

        globalThis.Image = originalImage
    })
})
