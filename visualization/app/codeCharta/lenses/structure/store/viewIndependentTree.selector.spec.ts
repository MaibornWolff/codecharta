import { CCFile, CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { viewIndependentTreeSelector } from "./viewIndependentTree.selector"

const buildStructureTree = (): CCFile =>
    ({
        map: {
            name: "root",
            path: "/root",
            type: NodeType.FOLDER,
            attributes: {},
            children: [
                {
                    name: "src",
                    path: "/root/src",
                    type: NodeType.FOLDER,
                    attributes: {},
                    children: [
                        { name: "a.ts", path: "/root/src/a.ts", type: NodeType.FILE, attributes: {} },
                        { name: "b.ts", path: "/root/src/b.ts", type: NodeType.FILE, attributes: {} }
                    ]
                },
                { name: "c.ts", path: "/root/c.ts", type: NodeType.FILE, attributes: {} }
            ]
        }
    }) as CCFile

const findNode = (node: CodeMapNode, path: string): CodeMapNode => {
    if (node.path === path) {
        return node
    }
    for (const child of node.children ?? []) {
        const match = findNode(child, path)
        if (match) {
            return match
        }
    }
    return undefined
}

describe("viewIndependentTreeSelector", () => {
    it("should count every file, since it knows nothing of the map's blacklist", () => {
        // Arrange & Act
        const tree = viewIndependentTreeSelector.projector(buildStructureTree())

        // Assert
        expect(tree.attributes.unary).toBe(3)
        expect(findNode(tree, "/root/src").attributes.unary).toBe(2)
        expect(findNode(tree, "/root/src/a.ts").attributes.unary).toBe(1)
    })

    it("should assign stable ids so nodes stay addressable across views", () => {
        // Arrange & Act
        const tree = viewIndependentTreeSelector.projector(buildStructureTree())

        // Assert
        expect(tree.id).toBe(0)
        expect(findNode(tree, "/root/src").id).toBe(1)
    })

    it("should leave the memoized structure tree untouched", () => {
        // Arrange
        const structureTree = buildStructureTree()

        // Act
        viewIndependentTreeSelector.projector(structureTree)

        // Assert
        expect(structureTree.map.attributes.unary).toBeUndefined()
    })

    it("should return nothing when no files are loaded", () => {
        // Arrange & Act & Assert
        expect(viewIndependentTreeSelector.projector(undefined)).toBeUndefined()
    })
})
