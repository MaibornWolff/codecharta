import { NameDataPair } from "../../../../../../model/codeCharta.api.model"
import { CcJson2 } from "../../../../../../model/ccjson2.model"
import { clone } from "../../../../../../util/clone"
import { TEST_FILE_CONTENT_CC_JSON_2 } from "../../../../../../mocks/dataMocks"
import { getCCFile } from "../ccFileHelper"
import { mapCcJson2ToCCFile } from "./ccJson2ToCCFile"
import sample1CcJson2 from "../../../../../../assets/sample1.cc.json"
import sample1Legacy from "../../../../../../resources/sample1_legacy_1_2.cc.json"
import { ExportCCFile } from "../../../../../../model/codeCharta.api.model"

function nameDataPair(content: CcJson2): NameDataPair {
    return { fileName: "fileName", fileSize: 42, content }
}

// ccsh sorts tree nodes (folders first, then alphabetical) while the 1.x normalizer preserves the
// source order, so the render-parity map compare is made order-insensitive by sorting children by name.
function sortChildrenByName<T extends { name: string; children?: T[] }>(node: T): T {
    if (!node.children) {
        return node
    }
    return { ...node, children: node.children.map(sortChildrenByName).sort((a, b) => a.name.localeCompare(b.name)) }
}

describe("mapCcJson2ToCCFile", () => {
    let file: CcJson2

    beforeEach(() => {
        file = clone(TEST_FILE_CONTENT_CC_JSON_2)
    })

    it("should build fileMeta from the 2.0 meta and the NameDataPair", () => {
        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.fileMeta).toEqual({
            fileName: "fileName",
            fileChecksum: "valid-md5-sample-cc2",
            projectName: "Sample 2.0 Map",
            apiVersion: "2.0",
            exportedFileSize: 42,
            repoCreationDate: ""
        })
    })

    it("should attach metric attributes by node id and keep a single root", () => {
        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.map.name).toBe("root")
        const bigLeaf = result.map.children.find(node => node.name === "big.ts")
        expect(bigLeaf.attributes).toEqual({ rloc: 100 })
        expect(result.map.attributes).toEqual({})
    })

    it("should strip list-valued (number[]) attributes", () => {
        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        const bigLeaf = result.map.children.find(node => node.name === "big.ts")
        expect(bigLeaf.attributes.authors).toBeUndefined()
    })

    it("should split metric and dependency attribute types onto nodes and edges", () => {
        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.settings.fileSettings.attributeTypes).toEqual({
            nodes: { rloc: "absolute" },
            edges: { pairingRate: "relative" }
        })
    })

    it("should resolve edge endpoints from node id to node path", () => {
        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.settings.fileSettings.edges).toEqual([
            { fromNodeName: "/root/big.ts", toNodeName: "/root/Parent/small.ts", attributes: { pairingRate: 42 } }
        ])
    })

    it("should drop edges with an unresolved endpoint", () => {
        // Arrange
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined)
        file.lenses.dependency.edges.push({ fromId: "/root/big.ts", toId: "/does/not/exist", attributes: {} })

        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.settings.fileSettings.edges).toHaveLength(1)
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })

    it("should produce the same map, edges and attributeTypes as the 1.5 source it was converted from (ccsh render parity)", () => {
        // Arrange — the REAL ccsh-converted 2.0 bundled sample (opaque hashed ids) vs the 1.x source it
        // was produced from. Proves the 2.0 reader's id→path join does not rely on id==path.
        const from1_5 = getCCFile({ fileName: "sample1.cc.json", fileSize: 0, content: sample1Legacy as unknown as ExportCCFile })
        const from2_0 = getCCFile({ fileName: "sample1.cc.json", fileSize: 0, content: sample1CcJson2 as unknown as CcJson2 })

        // Assert
        expect(sortChildrenByName(from2_0.map)).toEqual(sortChildrenByName(from1_5.map))
        expect(from2_0.settings.fileSettings.edges).toEqual(from1_5.settings.fileSettings.edges)
        expect(from2_0.settings.fileSettings.attributeTypes).toEqual(from1_5.settings.fileSettings.attributeTypes)
    })
})
