import { ClusteringData } from "../../model/codeCharta.model"
import { formatClusterShare, notAttributedShareOf, repositoryMarkersOf } from "./clusterPresentation"

const clusteringWithIds = (...ids: string[]): ClusteringData => ({
    title: "Author ownership",
    membership: "weighted",
    clusters: ids.map(id => ({ id, name: id, members: {} }))
})

describe("clusterPresentation", () => {
    describe("repositoryMarkersOf", () => {
        it("should give no marker when every cluster comes from one repository", () => {
            // Arrange
            const clustering = clusteringWithIds("a1b2c3d-author-1", "a1b2c3d-author-2")

            // Act
            const markers = repositoryMarkersOf(clustering)

            // Assert
            expect(markers.size).toBe(0)
        })

        it("should give each cluster its marker when two repositories meet", () => {
            // Arrange
            const clustering = clusteringWithIds("a1b2c3d-author-1", "f00ba42-author-1")

            // Act
            const markers = repositoryMarkersOf(clustering)

            // Assert
            expect(markers.get("a1b2c3d-author-1")).toBe("a1b2c3d")
            expect(markers.get("f00ba42-author-1")).toBe("f00ba42")
        })

        it("should give no marker to the clusters of another producer", () => {
            // Arrange
            const clustering = clusteringWithIds("team-core", "team-web")

            // Act
            const markers = repositoryMarkersOf(clustering)

            // Assert
            expect(markers.size).toBe(0)
        })
    })

    describe("formatClusterShare", () => {
        it.each([
            [0, "0%"],
            [0.004, "<1%"],
            [0.5, "50%"],
            [1, "100%"]
        ])("should show a share of %s as %s", (share, expected) => {
            // Arrange & Act
            const formatted = formatClusterShare(share)

            // Assert
            expect(formatted).toBe(expected)
        })
    })

    describe("notAttributedShareOf", () => {
        it("should give the remainder of what is attributed", () => {
            // Arrange & Act
            const remainder = notAttributedShareOf(0.75)

            // Assert
            expect(remainder).toBe(0.25)
        })

        it("should give nothing when weights only miss one through floating point", () => {
            // Arrange
            const attributed = 0.1 + 0.2 + 0.7 - Number.EPSILON

            // Act
            const remainder = notAttributedShareOf(attributed)

            // Assert
            expect(remainder).toBe(0)
        })

        it("should give nothing when weights exceed one", () => {
            // Arrange & Act
            const remainder = notAttributedShareOf(1.2)

            // Assert
            expect(remainder).toBe(0)
        })
    })
})
