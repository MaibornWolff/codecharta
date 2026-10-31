import { CCFile, ClusteringsData, FileState } from "../../../model/codeCharta.model"
import { FileSelectionState } from "../../../model/files/files"
import { clusteringsSelector, hasClusteringsSelector } from "./clusterings.selector"

const ownership = (id: string, members: Record<string, number>): ClusteringsData => ({
    "author-ownership": { title: "Author ownership", membership: "weighted", clusters: [{ id, name: id, members }] }
})

const fileState = (fileName: string, clusterings: ClusteringsData, selectedAs = FileSelectionState.Partial): FileState =>
    ({
        selectedAs,
        file: { fileMeta: { fileName }, settings: { fileSettings: { clusterings } }, map: { name: "root" } } as unknown as CCFile
    }) as FileState

describe("clusteringsSelector", () => {
    it("should hand the clusterings of a single visible file through unchanged", () => {
        // Arrange
        const clusterings = ownership("a", { "/root/a.ts": 0.5 })

        // Act
        const result = clusteringsSelector.projector([fileState("a.cc.json", clusterings)])

        // Assert
        expect(result).toBe(clusterings)
    })

    it("should union clusters over two visible files and place members under their file name", () => {
        // Arrange
        const first = fileState("a.cc.json", ownership("repoA-author-1", { "/root/a.ts": 1 }))
        const second = fileState("b.cc.json", ownership("repoB-author-1", { "/root/b.ts": 0.5 }))

        // Act
        const result = clusteringsSelector.projector([first, second])

        // Assert
        expect(result["author-ownership"].clusters).toEqual([
            { id: "repoA-author-1", name: "repoA-author-1", members: { "/root/a.cc.json/a.ts": 1 } },
            { id: "repoB-author-1", name: "repoB-author-1", members: { "/root/b.cc.json/b.ts": 0.5 } }
        ])
    })

    it("should union the members of one cluster over two visible files", () => {
        // Arrange
        const first = fileState("a.cc.json", ownership("repo-author-1", { "/root/a.ts": 1 }))
        const second = fileState("b.cc.json", ownership("repo-author-1", { "/root/b.ts": 0.5 }))

        // Act
        const result = clusteringsSelector.projector([first, second])

        // Assert
        expect(result["author-ownership"].clusters[0].members).toEqual({ "/root/a.cc.json/a.ts": 1, "/root/b.cc.json/b.ts": 0.5 })
    })

    it("should carry nothing in compare mode", () => {
        // Arrange
        const reference = fileState("a.cc.json", ownership("a", { "/root/a.ts": 1 }), FileSelectionState.Reference)
        const comparison = fileState("b.cc.json", ownership("a", { "/root/a.ts": 1 }), FileSelectionState.Comparison)

        // Act
        const result = clusteringsSelector.projector([reference, comparison])

        // Assert
        expect(result).toEqual({})
    })

    it("should read a file persisted before the lens existed as carrying nothing", () => {
        // Arrange
        const persisted = fileState("a.cc.json", undefined as unknown as ClusteringsData)

        // Act
        const result = clusteringsSelector.projector([persisted])

        // Assert
        expect(result).toEqual({})
    })
})

describe("hasClusteringsSelector", () => {
    it("should be true only when a clustering has a cluster", () => {
        // Arrange
        const empty: ClusteringsData = { teams: { title: "Teams", membership: "partition", clusters: [] } }

        // Act
        const withoutClusters = hasClusteringsSelector.projector(empty)
        const withClusters = hasClusteringsSelector.projector(ownership("a", { "/root/a.ts": 1 }))

        // Assert
        expect(withoutClusters).toBe(false)
        expect(withClusters).toBe(true)
    })
})
