import { ExportBlacklistType, ExportCCFile } from "../../../../../codeCharta.api.model"
import { AttributeTypeValue, NodeType } from "../../../../../codeCharta.model"
import { normalizeExportCCFileToCcJson2 } from "./normalizeToCcJson2"

function exportFile(): ExportCCFile {
    return {
        projectName: "Sample",
        apiVersion: "1.3",
        fileChecksum: "checksum-1",
        attributeTypes: { nodes: { rloc: AttributeTypeValue.absolute }, edges: { coupling: AttributeTypeValue.relative } },
        attributeDescriptors: { rloc: { title: "RLOC", description: "", hintLowValue: "", hintHighValue: "", link: "" } },
        edges: [{ fromNodeName: "/root/a.ts", toNodeName: "/root/b.ts", attributes: { coupling: 3 } }],
        blacklist: [{ path: "/root/a.ts", type: ExportBlacklistType.hide }],
        markedPackages: [{ path: "/root", color: "#000000" }],
        nodes: [
            {
                name: "root",
                type: NodeType.FOLDER,
                attributes: {},
                fixedPosition: { left: 1, top: 2, width: 3, height: 4 },
                children: [
                    { name: "a.ts", type: NodeType.FILE, attributes: { rloc: 10 }, link: "http://x" },
                    { name: "b.ts", type: NodeType.FILE, attributes: { rloc: 20 } }
                ]
            }
        ]
    }
}

describe("normalizeExportCCFileToCcJson2", () => {
    it("should build meta and a single root with path-based node ids", () => {
        const result = normalizeExportCCFileToCcJson2(exportFile())

        expect(result.meta).toEqual({ projectName: "Sample", apiVersion: "1.3", checksum: "checksum-1" })
        expect(result.files[0].id).toBe("/root")
        expect(result.files[0].children.map(child => child.id)).toEqual(["/root/a.ts", "/root/b.ts"])
    })

    it("should move node attributes into the metrics lens keyed by the path id", () => {
        const result = normalizeExportCCFileToCcJson2(exportFile())

        expect(result.lenses.metrics.attributes).toEqual({ "/root/a.ts": { rloc: 10 }, "/root/b.ts": { rloc: 20 } })
        expect(result.lenses.metrics.attributeTypes).toEqual({ rloc: "absolute" })
    })

    it("should map edges by node name to id and split edge attribute types into the dependency lens", () => {
        const result = normalizeExportCCFileToCcJson2(exportFile())

        expect(result.lenses.dependency.edges).toEqual([{ fromId: "/root/a.ts", toId: "/root/b.ts", attributes: { coupling: 3 } }])
        expect(result.lenses.dependency.attributeTypes).toEqual({ coupling: "relative" })
    })

    it("should carry the deprecated 1.x-only fields: blacklist (hide -> flatten), markedPackages and fixedPosition", () => {
        const result = normalizeExportCCFileToCcJson2(exportFile())

        expect(result.blacklist).toEqual([{ path: "/root/a.ts", type: "flatten" }])
        expect(result.markedPackages).toEqual([{ path: "/root", color: "#000000" }])
        expect(result.files[0].fixedPosition).toEqual({ left: 1, top: 2, width: 3, height: 4 })
    })
})
