import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { DomainExplorerRow } from "./domainExplorerRow"

const LEAF = { name: "a.ts", path: "/root/a.ts", id: 1, type: NodeType.FILE, attributes: { rloc: 0 } } as unknown as CodeMapNode

describe("DomainExplorerRow", () => {
    it("should render the trivial projection, since there is no 3D map to gate on", () => {
        // Arrange
        const row = new DomainExplorerRow()

        // Act
        const projection = row.project(LEAF)

        // Assert
        expect(projection).toEqual({
            isSelectable: true,
            isInactive: false,
            isItalic: false,
            isFlattened: false,
            title: "",
            decoration: null
        })
    })
})
