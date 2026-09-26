import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { CodeMapTooltipService } from "../../../renderer/threeViewer/threeViewer.facade"
import { hoveredNodePathSelector, selectedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { clearKeptHighlight, setHoveredNodePath, setSelectedNodePath } from "../../../stores/sharedView/sharedView.write.facade"
import { MetricsExplorerSelection } from "./metricsExplorerSelection"

const LEAF = { name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 4 } } as CodeMapNode

describe("MetricsExplorerSelection", () => {
    const codeMapTooltipService = { show: jest.fn(), hide: jest.fn() }

    function setup(selectedNodePath: string | null = null, hoveredNodePath: string | null = null) {
        TestBed.configureTestingModule({
            providers: [
                MetricsExplorerSelection,
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: selectedNodePathSelector, value: selectedNodePath },
                        { selector: hoveredNodePathSelector, value: hoveredNodePath }
                    ]
                }),
                { provide: CodeMapTooltipService, useValue: codeMapTooltipService }
            ]
        })
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
        return { selection: TestBed.inject(MetricsExplorerSelection), dispatchSpy }
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should publish the selected path, which every view then shows, and drop the kept highlight", () => {
        // Arrange
        const { selection, dispatchSpy } = setup()

        // Act
        selection.select(LEAF)

        // Assert
        expect(dispatchSpy.mock.calls).toEqual([[setSelectedNodePath({ value: LEAF.path })], [clearKeptHighlight()]])
    })

    it("should clear the selected path on deselect", () => {
        // Arrange
        const { selection, dispatchSpy } = setup()

        // Act
        selection.deselect()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setSelectedNodePath({ value: null }))
    })

    it("should publish the hovered path and show the metric tooltip on hover", () => {
        // Arrange
        const { selection, dispatchSpy } = setup()

        // Act
        selection.hover(LEAF, { right: 200, top: 100 } as DOMRect)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodePath({ value: LEAF.path }))
        expect(codeMapTooltipService.show).toHaveBeenCalledWith(LEAF, 200, 100)
    })

    it("should clear the hovered path and hide the tooltip when the hover ends", () => {
        // Arrange
        const { selection, dispatchSpy } = setup()

        // Act
        selection.hoverEnd()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodePath({ value: null }))
        expect(codeMapTooltipService.hide).toHaveBeenCalled()
    })

    it("should report a row selected or hovered from the shared view state", () => {
        // Arrange
        const { selection } = setup(LEAF.path, LEAF.path)

        // Act
        const isSelected = selection.isSelected(LEAF)
        const isHovered = selection.isHovered(LEAF)

        // Assert
        expect(isSelected).toBe(true)
        expect(isHovered).toBe(true)
    })
})
