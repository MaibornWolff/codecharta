import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { of } from "rxjs"
import { ExplorerRowProjection, projectExplorerRow } from "../../../lenses/explorerRow/explorerRowLens.facade"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { rootUnarySelector } from "../../../renderer/renderModel/renderModel.facade"
import { IdToBuildingService } from "../../../renderer/threeViewer/threeViewer.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { markedPackagesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { MetricsExplorerRow } from "./metricsExplorerRow"

jest.mock("../../../lenses/explorerRow/explorerRowLens.facade", () => ({
    projectExplorerRow: jest.fn()
}))

const LENS_RESULT: ExplorerRowProjection = {
    isSelectable: true,
    isInactive: false,
    isItalic: false,
    isFlattened: false,
    isHidden: false,
    title: "",
    decoration: null,
    markingColor: null
}
const MARKED_PACKAGES = [{ path: "/root/src", color: "#ff0000" }]
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
                        { selector: rootUnarySelector, value: 10 },
                        { selector: markedPackagesSelector, value: MARKED_PACKAGES }
                    ]
                }),
                { provide: IdToBuildingService, useValue: { buildingIds$: of(new Set([1, 2])) } }
            ]
        })
        row = TestBed.inject(MetricsExplorerRow)
    })

    it("should feed the projection lens the injected map inputs and opt into hiding excluded nodes", () => {
        // Act
        const projection = row.project(NODE)

        // Assert — the adapter forwards its injected map inputs and returns the lens result unchanged
        expect(projectExplorerRow).toHaveBeenCalledWith(NODE, {
            areaMetric: "rloc",
            buildingIds: new Set([1, 2]),
            rootUnary: 10,
            showsFlattenedState: true,
            hidesExcludedNodes: true,
            markedPackages: MARKED_PACKAGES
        })
        expect(projection).toBe(LENS_RESULT)
    })
})
