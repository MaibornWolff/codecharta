import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { of } from "rxjs"
import { ExplorerRowProjection, projectExplorerRow } from "../../../lenses/explorerRow/explorerRowLens.facade"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { rootUnarySelector } from "../../../renderer/renderModel/renderModel.facade"
import { IdToBuildingService } from "../../../renderer/threeViewer/threeViewer.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { MetricsExplorerRow } from "./metricsExplorerRow"

// The projection branches (selectability, dimming, decoration) are the lens's responsibility and are
// covered in explorerRow.projection.spec.ts. This adapter only wires the injected map inputs into the
// lens, so the lens is mocked and only that hand-off is asserted here.
jest.mock("../../../lenses/explorerRow/explorerRowLens.facade", () => ({
    projectExplorerRow: jest.fn()
}))

const LENS_RESULT: ExplorerRowProjection = { isSelectable: true, isDimmed: false, isItalic: false, title: "", decoration: null }
const NODE = { name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 4 } } as CodeMapNode

describe("MetricsExplorerRow", () => {
    let row: MetricsExplorerRow

    beforeEach(() => {
        ;(projectExplorerRow as jest.Mock).mockReturnValue(LENS_RESULT)
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

    it("should feed the projection lens the injected area metric, building ids and root unary", () => {
        // Act
        const projection = row.project(NODE)

        // Assert — the adapter forwards its injected map inputs and returns the lens result unchanged
        expect(projectExplorerRow).toHaveBeenCalledWith(NODE, { areaMetric: "rloc", buildingIds: new Set([1, 2]), rootUnary: 10 })
        expect(projection).toBe(LENS_RESULT)
    })
})
