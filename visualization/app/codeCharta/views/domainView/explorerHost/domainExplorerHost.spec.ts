import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { DomainBarReadStore } from "../../../features/domainBar/facade"
import { CodeMapNode, DomainLensData, NodeType } from "../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSizingMode } from "../../../model/wordCloud.model"
import { domainWordsSelector } from "../../../stores/domainLensSource/domainLensSource.read.facade"
import { HoverTooltipService } from "../../../util/hoverTooltip.service"
import { DomainExplorerHost } from "./domainExplorerHost"

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

describe("DomainExplorerHost", () => {
    const tooltipService = { show: jest.fn(), hide: jest.fn() }

    const setup = (sizingMode = WordCloudSizingMode.frequency, words = WORDS) => {
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            providers: [
                DomainExplorerHost,
                provideMockStore({ selectors: [{ selector: domainWordsSelector, value: words }] }),
                { provide: DomainBarReadStore, useValue: { settings: signal({ ...defaultWordCloudSettings, sizingMode }) } },
                { provide: HoverTooltipService, useValue: tooltipService }
            ]
        })
        return TestBed.inject(DomainExplorerHost)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should switch off the map-only chrome", () => {
        // Arrange & Act
        const host = setup()

        // Assert
        expect(host.capabilities).toEqual({ showRules: false, showSearch: false, showCounts: false })
    })

    it("should make every row selectable, since no 3D building has to exist", () => {
        // Arrange & Act — a #/domain deep link registers no buildings at all
        const host = setup()

        // Assert
        expect(host.isSelectable()).toBe(true)
    })

    it("should offer no context menu", () => {
        // Arrange & Act
        const host = setup()

        // Assert
        expect(host.hasContextMenu()).toBe(false)
    })

    it("should render no row decoration and no dimming", () => {
        // Arrange & Act
        const host = setup()

        // Assert
        expect(host.rowDecoration()).toBeNull()
        expect(host.rowState()).toEqual({ isDimmed: false, isItalic: false, title: "" })
    })

    it("should show the node name and its top five words by frequency on hover", () => {
        // Arrange
        const host = setup(WordCloudSizingMode.frequency)

        // Act
        host.onHover(NODE, ROW_RECT)

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
        const host = setup(WordCloudSizingMode.tfidf)

        // Act
        host.onHover(NODE, ROW_RECT)

        // Assert
        const [content] = tooltipService.show.mock.calls[0]
        expect(content.rows.map((row: { label: string }) => row.label)).toEqual(["node", "lexer", "tree", "parse", "token"])
    })

    it("should say so when a node carries no domain words", () => {
        // Arrange
        const host = setup(WordCloudSizingMode.frequency, {})

        // Act
        host.onHover(NODE, ROW_RECT)

        // Assert
        expect(tooltipService.show).toHaveBeenCalledWith(
            { title: "parser", rows: [{ label: "No domain words", value: "" }] },
            ROW_RECT.right,
            ROW_RECT.top
        )
    })

    it("should hide the tooltip when the hover ends", () => {
        // Arrange
        const host = setup()

        // Act
        host.onHoverEnd()

        // Assert
        expect(tooltipService.hide).toHaveBeenCalled()
    })
})
