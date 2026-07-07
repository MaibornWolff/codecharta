import { edgesSelector } from "./edges.selector"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { CCFile, Edge } from "../../../model/codeCharta.model"
import { TEST_FILE_DATA } from "../../../mocks/dataMocks"
import { clone } from "../../../util/clone"

describe("dependency lens edgesSelector", () => {
    const edge1: Edge = { fromNodeName: "/root/nodeA", toNodeName: "/root/nodeB", attributes: { pairingRate: 10 } }
    const edge2: Edge = { fromNodeName: "/root/nodeA", toNodeName: "/root/nodeC", attributes: { pairingRate: 20 } }

    function fileWith(name: string, edges: Edge[]): CCFile {
        const file = clone(TEST_FILE_DATA)
        file.fileMeta.fileName = name
        file.settings.fileSettings.edges = edges
        return file
    }

    it("should return the single visible file's edges unchanged", () => {
        // Arrange
        const files: FileState[] = [{ file: fileWith("single", [edge1, edge2]), selectedAs: FileSelectionState.Partial }]

        // Act
        const derived = edgesSelector.projector(files)

        // Assert — single-file passthrough: no merge, no path rewrite
        expect(derived).toEqual([
            { fromNodeName: "/root/nodeA", toNodeName: "/root/nodeB", attributes: { pairingRate: 10 } },
            { fromNodeName: "/root/nodeA", toNodeName: "/root/nodeC", attributes: { pairingRate: 20 } }
        ])
    })

    it("should prefix each edge endpoint with its file name when multiple partial files are visible", () => {
        // Arrange
        const files: FileState[] = [
            { file: fileWith("file1", [edge1]), selectedAs: FileSelectionState.Partial },
            { file: fileWith("file2", [edge2]), selectedAs: FileSelectionState.Partial }
        ]

        // Act
        const derived = edgesSelector.projector(files)

        // Assert — partial state => endpoints are rewritten to /root/<fileName>/<rest>
        expect(derived).toEqual([
            { fromNodeName: "/root/file1/nodeA", toNodeName: "/root/file1/nodeB", attributes: { pairingRate: 10 } },
            { fromNodeName: "/root/file2/nodeA", toNodeName: "/root/file2/nodeC", attributes: { pairingRate: 20 } }
        ])
    })

    it("should exclude edges of files whose selection state is None", () => {
        // Arrange
        const files: FileState[] = [
            { file: fileWith("visible", [edge1]), selectedAs: FileSelectionState.Partial },
            { file: fileWith("hidden", [edge2]), selectedAs: FileSelectionState.None }
        ]

        // Act — only "visible" survives getVisibleFiles => single-file passthrough
        const derived = edgesSelector.projector(files)

        // Assert — edge2 (hidden file) is gone; edge1 kept unprefixed
        expect(derived).toEqual([{ fromNodeName: "/root/nodeA", toNodeName: "/root/nodeB", attributes: { pairingRate: 10 } }])
    })

    it("should union both files' edges without prefixing and let the comparison overwrite the reference in delta mode", () => {
        // Arrange — reference + comparison => not a partial state => endpoints are NOT rewritten,
        // edges are unioned by raw from|to key, and colliding keys merge per-attribute (comparison wins).
        const edgeRefAB: Edge = { fromNodeName: "/root/nodeA", toNodeName: "/root/nodeB", attributes: { pairingRate: 10, avgCommits: 3 } }
        const edgeRefAC: Edge = { fromNodeName: "/root/nodeA", toNodeName: "/root/nodeC", attributes: { pairingRate: 20 } }
        const edgeCompAB: Edge = { fromNodeName: "/root/nodeA", toNodeName: "/root/nodeB", attributes: { pairingRate: 99 } }
        const edgeCompXY: Edge = { fromNodeName: "/root/nodeX", toNodeName: "/root/nodeY", attributes: { avgCommits: 5 } }
        const files: FileState[] = [
            { file: fileWith("reference", [edgeRefAB, edgeRefAC]), selectedAs: FileSelectionState.Reference },
            { file: fileWith("comparison", [edgeCompAB, edgeCompXY]), selectedAs: FileSelectionState.Comparison }
        ]

        // Act
        const derived = edgesSelector.projector(files)

        // Assert — A->B pairingRate overwritten 10->99 while its non-overwritten avgCommits survives;
        // A->C kept; X->Y added; insertion order = reference edges first, then comparison's new keys.
        expect(derived).toEqual([
            { fromNodeName: "/root/nodeA", toNodeName: "/root/nodeB", attributes: { pairingRate: 99, avgCommits: 3 } },
            { fromNodeName: "/root/nodeA", toNodeName: "/root/nodeC", attributes: { pairingRate: 20 } },
            { fromNodeName: "/root/nodeX", toNodeName: "/root/nodeY", attributes: { avgCommits: 5 } }
        ])
    })
})
