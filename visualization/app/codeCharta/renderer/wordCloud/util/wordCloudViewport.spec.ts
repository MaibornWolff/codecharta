import { isWholeCloud, keepCloudInSight, MAX_CLOUD_SCALE, panBy, WHOLE_CLOUD, zoomAt } from "./wordCloudViewport"

describe("wordCloudViewport", () => {
    const size = { width: 800, height: 600 }

    it("should keep the point under the pointer in place when zooming in", () => {
        // Arrange
        const pointer = { x: 200, y: 150 }

        // Act
        const viewport = zoomAt(WHOLE_CLOUD, pointer, 2, size)

        // Assert
        expect(viewport).toEqual({ scale: 2, x: -200, y: -150 })
    })

    it("should not zoom out past the whole cloud", () => {
        // Arrange & Act
        const viewport = zoomAt(WHOLE_CLOUD, { x: 200, y: 150 }, 0.5, size)

        // Assert
        expect(viewport).toEqual(WHOLE_CLOUD)
        expect(isWholeCloud(viewport)).toBe(true)
    })

    it("should not zoom in past the largest magnification", () => {
        // Arrange & Act
        const viewport = zoomAt(WHOLE_CLOUD, { x: 0, y: 0 }, MAX_CLOUD_SCALE * 2, size)

        // Assert
        expect(viewport.scale).toBe(MAX_CLOUD_SCALE)
    })

    it("should return to the whole cloud when zooming all the way out from a corner", () => {
        // Arrange
        const zoomedIntoCorner = zoomAt(WHOLE_CLOUD, { x: 800, y: 600 }, 4, size)

        // Act
        const viewport = zoomAt(zoomedIntoCorner, { x: 0, y: 0 }, 0.25, size)

        // Assert
        expect(viewport).toEqual(WHOLE_CLOUD)
    })

    it("should pan a magnified cloud by the dragged distance", () => {
        // Arrange
        const magnified = { scale: 2, x: -200, y: -150 }

        // Act
        const viewport = panBy(magnified, { x: -50, y: 30 }, size)

        // Assert
        expect(viewport).toEqual({ scale: 2, x: -250, y: -120 })
    })

    it("should not pan the cloud out of sight", () => {
        // Arrange
        const magnified = { scale: 2, x: -200, y: -150 }

        // Act
        const viewport = panBy(magnified, { x: 5000, y: -5000 }, size)

        // Assert
        expect(viewport).toEqual({ scale: 2, x: 0, y: -600 })
    })

    it("should leave the whole cloud where it is when it is dragged", () => {
        // Arrange & Act
        const viewport = panBy(WHOLE_CLOUD, { x: 40, y: 40 }, size)

        // Assert
        expect(viewport).toEqual(WHOLE_CLOUD)
    })

    it("should pull a magnified cloud back into a container that shrank", () => {
        // Arrange
        const pannedToTheFarCorner = { scale: 2, x: -800, y: -600 }

        // Act
        const viewport = keepCloudInSight(pannedToTheFarCorner, { width: 400, height: 300 })

        // Assert
        expect(viewport).toEqual({ scale: 2, x: -400, y: -300 })
    })
})
