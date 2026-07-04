import { edgesSelector } from "./edges.selector"
import { getMergedEdges } from "../../../util/edges/edges.merger"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { CCFile, Edge } from "../../../codeCharta.model"
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

    it("should equal the value the removed fileSettings.edges slice was re-derived to (single visible file)", () => {
        const files: FileState[] = [{ file: fileWith("single", [edge1, edge2]), selectedAs: FileSelectionState.Partial }]

        // Act — the derived selector vs the exact expression the updateFileSettings effect used to dispatch
        const derived = edgesSelector.projector(files)

        // Assert — value-parity with the old stored derivation, and the concrete single-file result
        expect(derived).toEqual(getMergedEdges(getVisibleFiles(files), isPartialState(files)))
        expect(derived).toEqual([edge1, edge2])
    })

    it("should equal the old derivation for multiple visible (partial) files", () => {
        const files: FileState[] = [
            { file: fileWith("file1", [edge1]), selectedAs: FileSelectionState.Partial },
            { file: fileWith("file2", [edge2]), selectedAs: FileSelectionState.Partial }
        ]

        const derived = edgesSelector.projector(files)

        expect(derived).toEqual(getMergedEdges(getVisibleFiles(files), isPartialState(files)))
    })

    it("should ignore non-visible files exactly as getVisibleFiles does", () => {
        const files: FileState[] = [
            { file: fileWith("visible", [edge1]), selectedAs: FileSelectionState.Partial },
            { file: fileWith("hidden", [edge2]), selectedAs: FileSelectionState.None }
        ]

        const derived = edgesSelector.projector(files)

        expect(derived).toEqual(getMergedEdges(getVisibleFiles(files), isPartialState(files)))
    })
})
