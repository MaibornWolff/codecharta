import { ClusteringData, ClusterMembership, KeyValuePair } from "../../../model/codeCharta.model"
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

const filesWithoutMetrics = (...paths: string[]): ReadonlyMap<string, KeyValuePair> => new Map(paths.map(path => [path, {}]))

describe("clusterSharesOf", () => {
    it("should sum a cluster's weights over the number of shown files, biggest share first", () => {
        // Arrange
        const shown = filesWithoutMetrics("/root/a", "/root/b", "/root/c", "/root/d")

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
        const shown = filesWithoutMetrics("/root/a")

        // Act
        const { rows } = clusterSharesOf(clustering(), shown)

        // Assert
        expect(rows.map(row => row.filePaths)).toEqual([["/root/a"], ["/root/a"]])
        expect(rows.find(row => row.name === "Author 3")).toBeUndefined()
    })

    it("should report the rest of the shown files as not attributed", () => {
        // Arrange
        const shown = filesWithoutMetrics("/root/a", "/root/d")

        // Act
        const { notAttributedShare } = clusterSharesOf(clustering(), shown)

        // Assert
        expect(notAttributedShare).toBe(0.5)
    })

    it("should report no remainder for an overlay, whose weights are never summed", () => {
        // Arrange
        const shown = filesWithoutMetrics("/root/a")

        // Act
        const { notAttributedShare } = clusterSharesOf(clustering("overlay"), shown)

        // Assert
        expect(notAttributedShare).toBeNull()
    })

    it("should report nothing when no file is shown", () => {
        // Arrange
        const shown = filesWithoutMetrics()

        // Act
        const shares = clusterSharesOf(clustering(), shown)

        // Assert
        expect(shares).toEqual({ rows: [], notAttributedShare: null, shareLabel: "share of files", attributeTitles: {} })
    })

    it("should mark the rows only when two repositories meet", () => {
        // Arrange
        const shown = filesWithoutMetrics("/root/a")
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

    describe("with the metric of the weight basis in the map", () => {
        const byLines: ClusteringData = {
            title: "Author ownership",
            membership: "weighted",
            weightBasis: "loc",
            clusters: [
                { id: "r1-author-small", name: "Small", members: { "/root/small": 1 } },
                { id: "r1-author-big", name: "Big", members: { "/root/big": 0.5 } }
            ]
        }
        const files = new Map([
            ["/root/small", { loc: 10 }],
            ["/root/big", { loc: 90 }]
        ])

        it("should weigh a cluster's files by their lines and say so", () => {
            // Arrange & Act
            const { rows, shareLabel } = clusterSharesOf(byLines, files)

            // Assert
            expect(rows.map(row => [row.name, row.share])).toEqual([
                ["Big", 0.45],
                ["Small", 0.1]
            ])
            expect(shareLabel).toBe("share of lines")
        })

        it("should report the lines nobody owns as not attributed", () => {
            // Arrange & Act
            const { notAttributedShare } = clusterSharesOf(byLines, files)

            // Assert
            expect(notAttributedShare).toBeCloseTo(0.45)
        })

        it("should count only the lines of shown files", () => {
            // Arrange
            const onlySmall = new Map([["/root/small", { loc: 10 }]])

            // Act
            const { rows } = clusterSharesOf(byLines, onlySmall)

            // Assert
            expect(rows.map(row => [row.name, row.share])).toEqual([["Small", 1]])
        })

        it("should keep a cluster whose files have no lines, at a share of nothing", () => {
            // Arrange
            const withBinary = new Map([
                ["/root/small", { loc: 10 }],
                ["/root/big", {}]
            ])

            // Act
            const { rows } = clusterSharesOf(byLines, withBinary)

            // Assert
            expect(rows.map(row => [row.name, row.share])).toEqual([
                ["Small", 1],
                ["Big", 0]
            ])
        })

        it("should keep a cluster's attributes as the map holds them, without deriving any", () => {
            // Arrange
            const withAttribute = {
                ...byLines,
                attributeTitles: { commits: "Commits" },
                clusters: [{ id: "small", name: "Small", members: { "/root/small": 1 }, attributes: { commits: 3 } }]
            }

            // Act
            const { rows, attributeTitles } = clusterSharesOf(withAttribute, files)

            // Assert
            expect(rows[0].attributes).toEqual({ commits: 3 })
            expect(attributeTitles).toEqual({ commits: "Commits" })
        })

        it("should name any other metric in the label", () => {
            // Arrange
            const byCommits = { ...byLines, weightBasis: "commits" }

            // Act
            const { shareLabel } = clusterSharesOf(byCommits, new Map([["/root/small", { commits: 3 }]]))

            // Assert
            expect(shareLabel).toBe("share of commits")
        })

        it("should fall back to files when no shown file holds the metric", () => {
            // Arrange
            const noLines = filesWithoutMetrics("/root/small", "/root/big")

            // Act
            const { rows, shareLabel } = clusterSharesOf(byLines, noLines)

            // Assert
            expect(rows.map(row => [row.name, row.share])).toEqual([
                ["Small", 0.5],
                ["Big", 0.25]
            ])
            expect(shareLabel).toBe("share of files")
        })
    })
})
