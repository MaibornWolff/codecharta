import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { of } from "rxjs"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { rootUnarySelector } from "../../../renderer/renderModel/renderModel.facade"
import { IdToBuildingService } from "../../../renderer/threeViewer/threeViewer.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { MetricsExplorerRow } from "./metricsExplorerRow"

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

describe("MetricsExplorerRow", () => {
    let row: MetricsExplorerRow

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MetricsExplorerRow,
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: rootUnarySelector, value: 10 }
                    ]
                }),
                { provide: IdToBuildingService, useValue: { buildingIds$: of(new Set([1, 2])) } }
            ]
        })
        row = TestBed.inject(MetricsExplorerRow)
    })

    it("should make a leaf with a building selectable", () => {
        // Arrange & Act & Assert
        expect(row.project(LEAF_WITH_BUILDING).isSelectable).toBe(true)
    })

    it("should not make a leaf without a building selectable", () => {
        // Arrange & Act & Assert
        expect(row.project(LEAF_WITHOUT_BUILDING).isSelectable).toBe(false)
    })

    it("should keep folders selectable so they can still toggle open", () => {
        // Arrange & Act & Assert
        expect(row.project(FOLDER).isSelectable).toBe(true)
    })

    it("should dim and italicise a row whose node has no area in the current area metric", () => {
        // Arrange & Act
        const projection = row.project(LEAF_WITHOUT_AREA)

        // Assert
        expect(projection).toMatchObject({ isDimmed: true, isItalic: true, title: "No Node Area for Chosen Metric" })
    })

    it("should leave a row with area undimmed and untitled", () => {
        // Arrange & Act
        const projection = row.project(LEAF_WITH_BUILDING)

        // Assert
        expect(projection).toMatchObject({ isDimmed: false, isItalic: false, title: "" })
    })

    it("should decorate a folder with its share of the root unary count", () => {
        // Arrange & Act & Assert
        expect(row.project(FOLDER).decoration).toBe("50% / 5")
    })

    it("should not decorate a leaf", () => {
        // Arrange & Act & Assert
        expect(row.project(LEAF_WITH_BUILDING).decoration).toBeNull()
    })
})
