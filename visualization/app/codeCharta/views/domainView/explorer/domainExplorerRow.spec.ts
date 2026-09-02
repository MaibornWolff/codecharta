import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { pathsWithDomainWordsSelector } from "../../../lenses/domain/domainLens.facade"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { DomainExplorerRow } from "./domainExplorerRow"

const LEAF_WITH_WORDS = {
    name: "a.ts",
    path: "/root/a.ts",
    id: 1,
    type: NodeType.FILE,
    attributes: { rloc: 0 }
} as unknown as CodeMapNode
const LEAF_WITHOUT_WORDS = { ...LEAF_WITH_WORDS, name: "b.ts", path: "/root/b.ts" } as CodeMapNode
const EXCLUDED_LEAF_WITH_WORDS = { ...LEAF_WITH_WORDS, isExcluded: true } as CodeMapNode

describe("DomainExplorerRow", () => {
    let row: DomainExplorerRow

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DomainExplorerRow,
                provideMockState(),
                provideMockStore({
                    selectors: [{ selector: pathsWithDomainWordsSelector, value: new Set([LEAF_WITH_WORDS.path]) }]
                })
            ]
        })
        row = TestBed.inject(DomainExplorerRow)
    })

    it("should render a node carrying domain words undimmed", () => {
        // Arrange & Act
        const projection = row.project(LEAF_WITH_WORDS)

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

    it("should dim and italicize a node carrying no domain words", () => {
        // Arrange & Act
        const projection = row.project(LEAF_WITHOUT_WORDS)

        // Assert
        expect(projection).toMatchObject({ isInactive: true, isItalic: true, title: "No domain words" })
    })

    it("should keep a node carrying no domain words selectable, since dimming is informational only", () => {
        // Arrange & Act
        const projection = row.project(LEAF_WITHOUT_WORDS)

        // Assert
        expect(projection.isSelectable).toBe(true)
    })

    it("should keep a node excluded by the metrics blacklist visible, since the domain view cannot manage exclusions", () => {
        // Arrange & Act
        const projection = row.project(EXCLUDED_LEAF_WITH_WORDS)

        // Assert
        expect(projection.isHidden).toBe(false)
    })
})
