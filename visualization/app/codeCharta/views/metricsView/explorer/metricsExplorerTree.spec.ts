import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { CodeMapNode, NodeType, SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { MetricsExplorerTree } from "./metricsExplorerTree"

const UNIFIED_MAP_NODE = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: { unary: 2, rloc: 30 },
    children: [
        { name: "small.ts", path: "/root/small.ts", type: NodeType.FILE, attributes: { unary: 1, rloc: 10 } },
        { name: "big.ts", path: "/root/big.ts", type: NodeType.FILE, attributes: { unary: 1, rloc: 20 } }
    ]
} as CodeMapNode

describe("MetricsExplorerTree", () => {
    let tree: MetricsExplorerTree

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MetricsExplorerTree,
                provideMockStore({
                    selectors: [
                        { selector: accumulatedDataSelector, value: { unifiedMapNode: UNIFIED_MAP_NODE } },
                        { selector: areaMetricSelector, value: "rloc" }
                    ]
                })
            ]
        })
        tree = TestBed.inject(MetricsExplorerTree)
    })

    it("should sort the decorated render-model tree by name", async () => {
        // Act
        const rootNode = await firstValueFrom(tree.rootNodeFor(SortingOption.NAME, true))

        // Assert
        expect(rootNode.children.map(child => child.name)).toEqual(["big.ts", "small.ts"])
    })

    it("should sort by the area metric the map view has chosen", async () => {
        // Act
        const rootNode = await firstValueFrom(tree.rootNodeFor(SortingOption.AREA_SIZE, false))

        // Assert
        expect(rootNode.children.map(child => child.name)).toEqual(["big.ts", "small.ts"])
    })
})
