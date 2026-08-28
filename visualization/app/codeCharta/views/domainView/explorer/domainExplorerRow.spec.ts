import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { DomainExplorerRow } from "./domainExplorerRow"

const LEAF = { name: "a.ts", path: "/root/a.ts", id: 1, type: NodeType.FILE, attributes: { rloc: 0 } } as unknown as CodeMapNode
const EXCLUDED_LEAF = { ...LEAF, name: "b.ts", path: "/root/b.ts", isExcluded: true } as CodeMapNode

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
            isHidden: false,
            title: "",
            decoration: null,
            markingColor: null
        })
    })

    it("should keep a node excluded by the metrics blacklist visible, since the domain view cannot manage exclusions", () => {
        // Arrange
        const row = new DomainExplorerRow()

        // Act
        const projection = row.project(EXCLUDED_LEAF)

        // Assert
        expect(projection.isHidden).toBe(false)
    })
})
