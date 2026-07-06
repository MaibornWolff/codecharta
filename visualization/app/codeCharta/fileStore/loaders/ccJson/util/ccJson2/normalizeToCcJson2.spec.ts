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
    it("should build meta and a single root with path-and-type node ids", () => {
        const result = normalizeExportCCFileToCcJson2(exportFile())

        expect(result.meta).toEqual({ projectName: "Sample", apiVersion: "1.3", checksum: "checksum-1" })
        expect(result.files[0].id).toBe("/root|Folder")
        expect(result.files[0].children.map(child => child.id)).toEqual(["/root/a.ts|File", "/root/b.ts|File"])
    })

    it("should move node attributes into the metrics lens keyed by the path-and-type id", () => {
        const result = normalizeExportCCFileToCcJson2(exportFile())

        expect(result.lenses.metrics.attributes).toEqual({ "/root/a.ts|File": { rloc: 10 }, "/root/b.ts|File": { rloc: 20 } })
        expect(result.lenses.metrics.attributeTypes).toEqual({ rloc: "absolute" })
    })

    it("should map edges by node name to the endpoint's path-and-type id and split edge attribute types into the dependency lens", () => {
        const result = normalizeExportCCFileToCcJson2(exportFile())

        expect(result.lenses.dependency.edges).toEqual([
            { fromId: "/root/a.ts|File", toId: "/root/b.ts|File", attributes: { coupling: 3 } }
        ])
        expect(result.lenses.dependency.attributeTypes).toEqual({ coupling: "relative" })
    })

    it("should give a File and a Folder with the same name distinct ids and metrics instead of colliding", () => {
        // Arrange: a legal 1.x shape - a File "foo" and a Folder "foo" under one parent.
        const file = exportFile()
        file.nodes[0].children = [
            { name: "foo", type: NodeType.FILE, attributes: { rloc: 1 } },
            { name: "foo", type: NodeType.FOLDER, attributes: { rloc: 2 }, children: [] }
        ]
        file.edges = []

        // Act
        const result = normalizeExportCCFileToCcJson2(file)

        // Assert: keyed by path-and-type, so neither bag clobbers the other.
        expect(result.files[0].children.map(child => child.id)).toEqual(["/root/foo|File", "/root/foo|Folder"])
        expect(result.lenses.metrics.attributes).toEqual({ "/root/foo|File": { rloc: 1 }, "/root/foo|Folder": { rloc: 2 } })
    })

    it("should carry the deprecated 1.x-only fields: blacklist (hide -> flatten), markedPackages and fixedPosition", () => {
        const result = normalizeExportCCFileToCcJson2(exportFile())

        expect(result.blacklist).toEqual([{ path: "/root/a.ts", type: "flatten" }])
        expect(result.markedPackages).toEqual([{ path: "/root", color: "#000000" }])
        expect(result.files[0].fixedPosition).toEqual({ left: 1, top: 2, width: 3, height: 4 })
    })
})
