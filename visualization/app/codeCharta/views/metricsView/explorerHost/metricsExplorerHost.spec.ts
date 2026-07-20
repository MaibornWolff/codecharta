import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { of } from "rxjs"
import { CodeMapMouseEventService } from "../../../features/codeMap/facade"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { rootUnarySelector } from "../../../renderer/renderModel/renderModel.facade"
import {
    CodeMapTooltipService,
    IdToBuildingService,
    ThreeRendererService,
    ThreeSceneService
} from "../../../renderer/threeViewer/threeViewer.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { MetricsExplorerHost } from "./metricsExplorerHost"

const FOLDER = {
    name: "src",
    path: "/root/src",
    id: 1,
    type: NodeType.FOLDER,
    attributes: { rloc: 10, unary: 5 },
    children: [{ name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 4 } }]
} as unknown as CodeMapNode

const LEAF_WITH_BUILDING = { name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 4 } } as CodeMapNode
const LEAF_WITHOUT_BUILDING = { name: "b.ts", path: "/root/src/b.ts", id: 9, type: NodeType.FILE, attributes: { rloc: 4 } } as CodeMapNode
const LEAF_WITHOUT_AREA = { name: "c.ts", path: "/root/src/c.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 0 } } as CodeMapNode

describe("MetricsExplorerHost", () => {
    const building = { id: 2 }
    const threeSceneService = { selectBuilding: jest.fn(), clearSelection: jest.fn(), clearConstantHighlight: jest.fn() }
    const threeRendererService = { render: jest.fn() }
    const codeMapMouseEventService = { drawLabelSelectedBuilding: jest.fn(), hoverNode: jest.fn(), unhoverNode: jest.fn() }
    const codeMapTooltipService = { show: jest.fn(), hide: jest.fn() }

    let host: MetricsExplorerHost

    beforeEach(() => {
        jest.clearAllMocks()
        TestBed.configureTestingModule({
            providers: [
                MetricsExplorerHost,
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: rootUnarySelector, value: 10 }
                    ]
                }),
                { provide: ThreeSceneService, useValue: threeSceneService },
                { provide: ThreeRendererService, useValue: threeRendererService },
                { provide: CodeMapMouseEventService, useValue: codeMapMouseEventService },
                { provide: CodeMapTooltipService, useValue: codeMapTooltipService },
                { provide: IdToBuildingService, useValue: { get: () => building, buildingIds$: of(new Set([1, 2])) } }
            ]
        })
        host = TestBed.inject(MetricsExplorerHost)
    })

    it("should keep the full explorer chrome", () => {
        // Arrange & Act & Assert
        expect(host.capabilities).toEqual({ showRules: true, showSearch: true, showCounts: true })
    })

    it("should make a leaf with a building selectable", () => {
        // Arrange & Act & Assert
        expect(host.isSelectable(LEAF_WITH_BUILDING)).toBe(true)
    })

    it("should not make a leaf without a building selectable", () => {
        // Arrange & Act & Assert
        expect(host.isSelectable(LEAF_WITHOUT_BUILDING)).toBe(false)
    })

    it("should keep folders selectable so they can still toggle open", () => {
        // Arrange & Act & Assert
        expect(host.isSelectable(FOLDER)).toBe(true)
    })

    it("should dim a row whose node has no area in the current area metric", () => {
        // Arrange & Act
        const rowState = host.rowState(LEAF_WITHOUT_AREA)

        // Assert
        expect(rowState).toEqual({ isDimmed: true, isItalic: true, title: "No Node Area for Chosen Metric" })
    })

    it("should leave a row with area undimmed and untitled", () => {
        // Arrange & Act
        const rowState = host.rowState(LEAF_WITH_BUILDING)

        // Assert
        expect(rowState).toEqual({ isDimmed: false, isItalic: false, title: "" })
    })

    it("should decorate a folder with its share of the root unary count", () => {
        // Arrange & Act & Assert
        expect(host.rowDecoration(FOLDER)).toBe("50% / 5")
    })

    it("should not decorate a leaf", () => {
        // Arrange & Act & Assert
        expect(host.rowDecoration(LEAF_WITH_BUILDING)).toBeNull()
    })

    it("should suppress the context menu for a node with no area", () => {
        // Arrange & Act & Assert
        expect(host.hasContextMenu(LEAF_WITHOUT_AREA)).toBe(false)
        expect(host.hasContextMenu(LEAF_WITH_BUILDING)).toBe(true)
    })

    it("should hover the building and show the metric tooltip anchored to the row", () => {
        // Arrange & Act
        host.onHover(LEAF_WITH_BUILDING, { right: 200, top: 100 } as DOMRect)

        // Assert
        expect(codeMapMouseEventService.hoverNode).toHaveBeenCalledWith(LEAF_WITH_BUILDING.path)
        expect(codeMapTooltipService.show).toHaveBeenCalledWith(LEAF_WITH_BUILDING, 200, 100)
    })

    it("should unhover the building and hide the tooltip when the hover ends", () => {
        // Arrange & Act
        host.onHoverEnd()

        // Assert
        expect(codeMapMouseEventService.unhoverNode).toHaveBeenCalled()
        expect(codeMapTooltipService.hide).toHaveBeenCalled()
    })

    it("should select the corresponding building and re-render on select", () => {
        // Arrange & Act
        host.onSelect(LEAF_WITH_BUILDING)

        // Assert
        expect(codeMapMouseEventService.drawLabelSelectedBuilding).toHaveBeenCalledWith(building)
        expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(building)
        expect(threeSceneService.clearConstantHighlight).toHaveBeenCalledTimes(1)
        expect(threeRendererService.render).toHaveBeenCalledTimes(1)
    })

    it("should clear the scene selection and re-render on deselect", () => {
        // Arrange & Act
        host.onDeselect()

        // Assert
        expect(threeSceneService.clearSelection).toHaveBeenCalledTimes(1)
        expect(threeSceneService.selectBuilding).not.toHaveBeenCalled()
        expect(threeRendererService.render).toHaveBeenCalledTimes(1)
    })
})
