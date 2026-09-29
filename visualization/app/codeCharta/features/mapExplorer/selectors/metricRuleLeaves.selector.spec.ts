import { CCFile, CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { metricRuleLeavesSelector } from "./metricRuleLeaves.selector"

const file = (name: string): CodeMapNode => ({ name, path: `/root/${name}`, type: NodeType.FILE, attributes: { mcc: 1 } })

const treeWith = (children: CodeMapNode[]) =>
    ({
        map: { name: "root", path: "/root", type: NodeType.FOLDER, attributes: {}, children }
    }) as CCFile

describe("metricRuleLeavesSelector", () => {
    it("should return the files of the tree", () => {
        // Arrange
        const tree = treeWith([file("a.ts"), file("b.ts")])

        // Act
        const leaves = metricRuleLeavesSelector.projector(tree)

        // Assert
        expect(leaves.map(leaf => leaf.name)).toEqual(["a.ts", "b.ts"])
    })

    it("should leave folders out", () => {
        // Arrange
        const tree = treeWith([{ name: "src", path: "/root/src", type: NodeType.FOLDER, attributes: {}, children: [file("deep.ts")] }])

        // Act
        const leaves = metricRuleLeavesSelector.projector(tree)

        // Assert
        expect(leaves.map(leaf => leaf.name)).toEqual(["deep.ts"])
    })

    it("should return nothing while no map is loaded", () => {
        // Arrange & Act & Assert
        expect(metricRuleLeavesSelector.projector(undefined)).toEqual([])
    })

    it("should return nothing for a tree without a map", () => {
        // Arrange & Act & Assert
        expect(metricRuleLeavesSelector.projector({} as CCFile)).toEqual([])
    })
})
