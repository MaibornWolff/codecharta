import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { DomainBarReadStore } from "../../../features/domainBar/facade"
import { CodeMapNode, DomainLensData, NodeType } from "../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSizingMode } from "../../../model/wordCloud.model"
import { domainWordsSelector } from "../../../stores/domainLensSource/domainLensSource.read.facade"
import { HoverTooltipService } from "../../../util/hoverTooltip.service"
import { DomainSelectionStore } from "../stores/domainSelection.store"
import { DomainExplorerSelection } from "./domainExplorerSelection"

const NODE = { name: "parser", path: "/root/parser", type: NodeType.FOLDER, attributes: {} } as unknown as CodeMapNode
const ROW_RECT = { right: 200, top: 100 } as DOMRect

const WORDS: DomainLensData = {
    "/root/parser": [
        { text: "token", frequency: 3, tfidf: 0.1 },
        { text: "parse", frequency: 10, tfidf: 0.2 },
        { text: "node", frequency: 7, tfidf: 0.9 },
        { text: "tree", frequency: 5, tfidf: 0.4 },
        { text: "lexer", frequency: 1, tfidf: 0.7 },
        { text: "visit", frequency: 8, tfidf: 0.05 }
    ]
}

describe("DomainExplorerSelection", () => {
    const tooltipService = { show: jest.fn(), hide: jest.fn() }

    const setup = (sizingMode = WordCloudSizingMode.frequency, words = WORDS) => {
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            providers: [
                DomainExplorerSelection,
                provideMockStore({ selectors: [{ selector: domainWordsSelector, value: words }] }),
                { provide: DomainBarReadStore, useValue: { settings: signal({ ...defaultWordCloudSettings, sizingMode }) } },
                { provide: HoverTooltipService, useValue: tooltipService }
            ]
        })
        return { selection: TestBed.inject(DomainExplorerSelection), store: TestBed.inject(DomainSelectionStore) }
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should drive the domain-local selection store on select and clear it on deselect", () => {
        // Arrange
        const { selection, store } = setup()

        // Act
        selection.select(NODE)

        // Assert
        expect(store.selectedNodePath()).toBe("/root/parser")
        expect(selection.isSelected(NODE)).toBe(true)

        // Act
        selection.deselect()

        // Assert
        expect(store.selectedNodePath()).toBeNull()
        expect(selection.isSelected(NODE)).toBe(false)
    })

    it("should never report a row as hovered, since there is no map hover signal", () => {
        // Arrange & Act
        const { selection } = setup()

        // Assert
        expect(selection.isHovered()).toBe(false)
    })

    it("should show the node name and its top five words by frequency on hover", () => {
        // Arrange
        const { selection } = setup(WordCloudSizingMode.frequency)

        // Act
        selection.hover(NODE, ROW_RECT)

        // Assert
        expect(tooltipService.show).toHaveBeenCalledWith(
            {
                title: "parser",
                rows: [
                    { label: "parse", value: "10" },
                    { label: "visit", value: "8" },
                    { label: "node", value: "7" },
                    { label: "tree", value: "5" },
                    { label: "token", value: "3" }
                ]
            },
            ROW_RECT.right,
            ROW_RECT.top
        )
    })

    it("should rank the tooltip words by tfidf when that is the active sizing mode", () => {
        // Arrange — the tooltip previews what selecting the node will show in the cloud
        const { selection } = setup(WordCloudSizingMode.tfidf)

        // Act
        selection.hover(NODE, ROW_RECT)

        // Assert
        const [content] = tooltipService.show.mock.calls[0]
        expect(content.rows.map((row: { label: string }) => row.label)).toEqual(["node", "lexer", "tree", "parse", "token"])
    })

    it("should say so when a node carries no domain words", () => {
        // Arrange
        const { selection } = setup(WordCloudSizingMode.frequency, {})

        // Act
        selection.hover(NODE, ROW_RECT)

        // Assert
        expect(tooltipService.show).toHaveBeenCalledWith(
            { title: "parser", rows: [{ label: "No domain words", value: "" }] },
            ROW_RECT.right,
            ROW_RECT.top
        )
    })

    it("should hide the tooltip when the hover ends", () => {
        // Arrange
        const { selection } = setup()

        // Act
        selection.hoverEnd()

        // Assert
        expect(tooltipService.hide).toHaveBeenCalled()
    })
})
