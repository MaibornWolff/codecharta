import { TEST_FILE_CONTENT_CC_JSON_2 } from "../../../../../../mocks/dataMocks"
import { CcJson2 } from "../../../../../../model/ccjson2.model"
import { ExportCCFile, NameDataPair } from "../../../../../../model/codeCharta.api.model"
import sample1CcJson2 from "../../../../../../resources/sample1_converted_to_2_0.cc.json"
import sample1Legacy from "../../../../../../resources/sample1_legacy_1_2.cc.json"
import { clone } from "../../../../../../util/clone"
import { getCCFile } from "../ccFileHelper"
import { mapCcJson2ToCCFile } from "./ccJson2ToCCFile"

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

    it("should carry the graph flags of a dependency edge", () => {
        // Arrange
        file.lenses.dependency.edges[0].isCyclic = true
        file.lenses.dependency.edges[0].isPointingUpwards = true

        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.settings.fileSettings.edges[0].isCyclic).toBe(true)
        expect(result.settings.fileSettings.edges[0].isPointingUpwards).toBe(true)
    })

    it("should re-key dependency levels from node id to node path", () => {
        // Arrange
        ;(file.lenses as Record<string, unknown>).dependency = {
            ...file.lenses.dependency,
            nodes: { "/root": { level: 0 }, "/root/big.ts": { level: 2 } }
        }

        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.settings.fileSettings.dependencyLevels).toEqual({ "/root": 0, "/root/big.ts": 2 })
    })

    it("should drop a dependency level whose node id does not resolve to a path", () => {
        // Arrange
        ;(file.lenses as Record<string, unknown>).dependency = { ...file.lenses.dependency, nodes: { "ghost-id": { level: 4 } } }

        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.settings.fileSettings.dependencyLevels).toEqual({})
    })

    describe("declarations of the dependency lens", () => {
        beforeEach(() => {
            file.lenses.dependency.namespaces = { com: { level: 0 }, "com.game": { parent: "com", level: 1 } }
            file.lenses.dependency.leaves = {
                "/root/big.ts": { "com.game.Big": { name: "Big", kind: "class", language: "java", namespace: "com.game", level: 2 } },
                "/root/Parent/small.ts": { small: { kind: "function" } },
                "missing-id": { ghost: { kind: "class" } }
            }
            file.lenses.dependency.leafEdges = [
                {
                    fromId: "/root/big.ts",
                    fromLeaf: "com.game.Big",
                    toId: "/root/Parent/small.ts",
                    toLeaf: "small",
                    attributes: { dependencies: 2 },
                    usage: ["inheritance", "usage"],
                    isCyclic: true,
                    isPointingUpwards: true
                },
                { fromId: "/root/big.ts", fromLeaf: "com.game.Big", toId: "/root/big.ts", toLeaf: "com.game.Big" },
                { fromId: "/root/big.ts", fromLeaf: "com.game.Big", toId: "missing-id", toLeaf: "ghost" }
            ]
        })

        it("should keep the namespaces and re-key the leaves from node id to node path, named by their key unless they carry a name", () => {
            // Arrange
            jest.spyOn(console, "warn").mockImplementation(() => {})

            // Act
            const { dependencyDeclarations } = mapCcJson2ToCCFile(file, nameDataPair(file)).settings.fileSettings

            // Assert
            expect(dependencyDeclarations.namespaces).toEqual({ com: { level: 0 }, "com.game": { parent: "com", level: 1 } })
            expect(dependencyDeclarations.leaves).toEqual({
                "/root/big.ts": { "com.game.Big": { name: "Big", kind: "class", namespace: "com.game", level: 2 } },
                "/root/Parent/small.ts": { small: { name: "small", kind: "function" } }
            })
            expect(console.warn).toHaveBeenCalledWith("Dropping dependency-lens declarations with unresolved node id: missing-id")
        })

        it("should resolve the ends of the leaf edges and drop one with an unresolved end", () => {
            // Arrange
            jest.spyOn(console, "warn").mockImplementation(() => {})

            // Act
            const { leafEdges } = mapCcJson2ToCCFile(file, nameDataPair(file)).settings.fileSettings.dependencyDeclarations

            // Assert
            expect(leafEdges).toEqual([
                {
                    fromNodeName: "/root/big.ts",
                    fromLeaf: "com.game.Big",
                    toNodeName: "/root/Parent/small.ts",
                    toLeaf: "small",
                    attributes: { dependencies: 2 },
                    usage: ["inheritance", "usage"],
                    isCyclic: true,
                    isPointingUpwards: true
                },
                {
                    fromNodeName: "/root/big.ts",
                    fromLeaf: "com.game.Big",
                    toNodeName: "/root/big.ts",
                    toLeaf: "com.game.Big",
                    attributes: {},
                    usage: [],
                    isCyclic: undefined,
                    isPointingUpwards: undefined
                }
            ])
            expect(console.warn).toHaveBeenCalledWith("Dropping declaration edge with unresolved endpoint(s): /root/big.ts -> missing-id")
        })

        it("should leave a file without the layer without its tables", () => {
            // Arrange
            const plain = clone(TEST_FILE_CONTENT_CC_JSON_2)

            // Act
            const { dependencyDeclarations } = mapCcJson2ToCCFile(plain, nameDataPair(plain)).settings.fileSettings

            // Assert
            expect(dependencyDeclarations).toEqual({})
        })
    })

    it("should re-key domain words from node id to node path", () => {
        // Arrange
        ;(file.lenses as Record<string, unknown>).domain = {
            nodes: {
                "/root": { words: [{ text: "invoice", frequency: 12, tfidf: 0.4 }] },
                "/root/big.ts": { words: [{ text: "payment", frequency: 5 }] }
            }
        }

        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.settings.fileSettings.domainWords).toEqual({
            "/root": [{ text: "invoice", frequency: 12, tfidf: 0.4 }],
            "/root/big.ts": [{ text: "payment", frequency: 5 }]
        })
    })

    it("should drop domain words whose node id does not resolve to a path", () => {
        // Arrange
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined)
        ;(file.lenses as Record<string, unknown>).domain = {
            nodes: {
                "/root/big.ts": { words: [{ text: "payment", frequency: 5 }] },
                "/does/not/exist": { words: [{ text: "ghost", frequency: 1 }] }
            }
        }

        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.settings.fileSettings.domainWords).toEqual({ "/root/big.ts": [{ text: "payment", frequency: 5 }] })
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })

    it("should default domain words to an empty map when the file has no domain lens", () => {
        // Act
        const result = mapCcJson2ToCCFile(file, nameDataPair(file))

        // Assert
        expect(result.settings.fileSettings.domainWords).toEqual({})
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
        // Arrange — the REAL ccsh-converted 2.0 sample (opaque hashed ids) vs the 1.x source it
        // was produced from. Proves the 2.0 reader's id→path join does not rely on id==path.
        const from1_5 = getCCFile({ fileName: "sample1.cc.json", fileSize: 0, content: sample1Legacy as unknown as ExportCCFile })
        const from2_0 = getCCFile({ fileName: "sample1.cc.json", fileSize: 0, content: sample1CcJson2 as unknown as CcJson2 })

        // Assert
        expect(sortChildrenByName(from2_0.map)).toEqual(sortChildrenByName(from1_5.map))
        expect(from2_0.settings.fileSettings.edges).toEqual(from1_5.settings.fileSettings.edges)
        expect(from2_0.settings.fileSettings.attributeTypes).toEqual(from1_5.settings.fileSettings.attributeTypes)
    })
})
