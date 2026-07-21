import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { CodeMapMouseEventService } from "../../../features/codeMap/facade"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import {
    CodeMapTooltipService,
    IdToBuildingService,
    ThreeRendererService,
    ThreeSceneService
} from "../../../renderer/threeViewer/threeViewer.facade"
import { hoveredNodeIdSelector, selectedBuildingIdSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setHoveredNodeId, setSelectedBuildingId } from "../../../stores/sharedView/sharedView.write.facade"
import { MetricsExplorerSelection } from "./metricsExplorerSelection"

const LEAF = { name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 4 } } as CodeMapNode

describe("MetricsExplorerSelection", () => {
    const building = { id: 2 }
    const threeSceneService = { selectBuilding: jest.fn(), clearSelection: jest.fn(), clearConstantHighlight: jest.fn() }
    const threeRendererService = { render: jest.fn() }
    const codeMapMouseEventService = { drawLabelSelectedBuilding: jest.fn(), hoverNode: jest.fn(), unhoverNode: jest.fn() }
    const codeMapTooltipService = { show: jest.fn(), hide: jest.fn() }

    let selection: MetricsExplorerSelection
    let dispatchSpy: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        TestBed.configureTestingModule({
            providers: [
                MetricsExplorerSelection,
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: selectedBuildingIdSelector, value: null },
                        { selector: hoveredNodeIdSelector, value: null }
                    ]
                }),
                { provide: ThreeSceneService, useValue: threeSceneService },
                { provide: ThreeRendererService, useValue: threeRendererService },
                { provide: CodeMapMouseEventService, useValue: codeMapMouseEventService },
                { provide: CodeMapTooltipService, useValue: codeMapTooltipService },
                { provide: IdToBuildingService, useValue: { get: () => building } }
            ]
        })
        selection = TestBed.inject(MetricsExplorerSelection)
        dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
    })

    it("should publish the path and select the building on select", () => {
        // Arrange & Act
        selection.select(LEAF)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setSelectedBuildingId({ value: LEAF.path }))
        expect(codeMapMouseEventService.drawLabelSelectedBuilding).toHaveBeenCalledWith(building)
        expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(building)
        expect(threeSceneService.clearConstantHighlight).toHaveBeenCalledTimes(1)
        expect(threeRendererService.render).toHaveBeenCalledTimes(1)
    })

    it("should clear the path and the scene selection on deselect", () => {
        // Arrange & Act
        selection.deselect()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setSelectedBuildingId({ value: null }))
        expect(threeSceneService.clearSelection).toHaveBeenCalledTimes(1)
        expect(threeSceneService.selectBuilding).not.toHaveBeenCalled()
        expect(threeSceneService.clearConstantHighlight).toHaveBeenCalledTimes(1)
        expect(threeRendererService.render).toHaveBeenCalledTimes(1)
    })

    it("should publish the hovered path and show the metric tooltip on hover", () => {
        // Arrange & Act
        selection.hover(LEAF, { right: 200, top: 100 } as DOMRect)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodeId({ value: LEAF.path }))
        expect(codeMapMouseEventService.hoverNode).toHaveBeenCalledWith(LEAF.path)
        expect(codeMapTooltipService.show).toHaveBeenCalledWith(LEAF, 200, 100)
    })

    it("should clear the hovered path and hide the tooltip when the hover ends", () => {
        // Arrange & Act
        selection.hoverEnd()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodeId({ value: null }))
        expect(codeMapMouseEventService.unhoverNode).toHaveBeenCalled()
        expect(codeMapTooltipService.hide).toHaveBeenCalled()
    })
})

describe("MetricsExplorerSelection reading the shared view", () => {
    beforeEach(() => jest.clearAllMocks())

    it("should report a row selected or hovered from the shared view state", () => {
        // Arrange
        TestBed.configureTestingModule({
            providers: [
                MetricsExplorerSelection,
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: selectedBuildingIdSelector, value: LEAF.path },
                        { selector: hoveredNodeIdSelector, value: LEAF.path }
                    ]
                }),
                { provide: ThreeSceneService, useValue: {} },
                { provide: ThreeRendererService, useValue: {} },
                { provide: CodeMapMouseEventService, useValue: {} },
                { provide: CodeMapTooltipService, useValue: {} },
                { provide: IdToBuildingService, useValue: { get: () => ({}) } }
            ]
        })
        const selection = TestBed.inject(MetricsExplorerSelection)

        // Act & Assert
        expect(selection.isSelected(LEAF)).toBe(true)
        expect(selection.isHovered(LEAF)).toBe(true)
    })
})
