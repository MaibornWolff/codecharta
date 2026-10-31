import { ClusteringData, ClusterMembership } from "../../../model/codeCharta.model"
import { clusterSharesOf } from "./clusterShares"

const clustering = (membership: ClusterMembership = "weighted"): ClusteringData => ({
    title: "Author ownership",
    membership,
    clusters: [
        { id: "r1-author-1", name: "Author 1", members: { "/root/a": 0.5, "/root/b": 0.25 } },
        { id: "r1-author-2", name: "Author 2", members: { "/root/a": 0.5, "/root/b": 0.75, "/root/c": 1 } },
        { id: "r1-author-3", name: "Author 3", members: { "/root/gone": 1 } }
    ]
})

describe("clusterSharesOf", () => {
    it("should sum a cluster's weights over the number of shown files, biggest share first", () => {
        // Arrange
        const shown = new Set(["/root/a", "/root/b", "/root/c", "/root/d"])

        // Act
        const { rows } = clusterSharesOf(clustering(), shown)

        // Assert
        expect(rows.map(row => [row.name, row.share])).toEqual([
            ["Author 2", 0.5625],
            ["Author 1", 0.1875]
        ])
    })

    it("should only count and light shown files and leave out a cluster with none", () => {
        // Arrange
        const shown = new Set(["/root/a"])

        // Act
        const { rows } = clusterSharesOf(clustering(), shown)

        // Assert
        expect(rows.map(row => row.filePaths)).toEqual([["/root/a"], ["/root/a"]])
        expect(rows.find(row => row.name === "Author 3")).toBeUndefined()
    })

    it("should report the rest of the shown files as not attributed", () => {
        // Arrange
        const shown = new Set(["/root/a", "/root/d"])

        // Act
        const { notAttributedShare } = clusterSharesOf(clustering(), shown)

        // Assert
        expect(notAttributedShare).toBe(0.5)
    })

    it("should report no remainder for an overlay, whose weights are never summed", () => {
        // Arrange
        const shown = new Set(["/root/a"])

        // Act
        const { notAttributedShare } = clusterSharesOf(clustering("overlay"), shown)

        // Assert
        expect(notAttributedShare).toBeNull()
    })

    it("should report nothing when no file is shown", () => {
        // Arrange
        const shown = new Set<string>()

        // Act
        const shares = clusterSharesOf(clustering(), shown)

        // Assert
        expect(shares).toEqual({ rows: [], notAttributedShare: null })
    })

    it("should mark the rows only when two repositories meet", () => {
        // Arrange
        const shown = new Set(["/root/a"])
        const twoRepositories: ClusteringData = {
            title: "Author ownership",
            membership: "weighted",
            clusters: [
                { id: "a1b2c3d-author-1", name: "Author 1", members: { "/root/a": 0.5 } },
                { id: "f00ba42-author-1", name: "Author 1", members: { "/root/a": 0.5 } }
            ]
        }

        // Act
        const { rows } = clusterSharesOf(twoRepositories, shown)

        // Assert
        expect(rows.map(row => row.repositoryMarker)).toEqual(["a1b2c3d", "f00ba42"])
    })
})
