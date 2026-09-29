import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { CodeMapNode, NodeType, SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { MapExplorerTree } from "./mapExplorerTree"

const TREE = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: { unary: 3, rloc: 30, mcc: 3 },
    children: [
        { name: "z", path: "/root/z", type: NodeType.FOLDER, attributes: { unary: 1, rloc: 20, mcc: 1 }, children: [] },
        { name: "a", path: "/root/a", type: NodeType.FOLDER, attributes: { unary: 2, rloc: 10, mcc: 2 }, children: [] }
    ]
} as CodeMapNode

describe("MapExplorerTree", () => {
    function setup() {
        TestBed.configureTestingModule({
            providers: [
                MapExplorerTree,
                provideMockStore({
                    selectors: [
                        { selector: accumulatedDataSelector, value: { unifiedMapNode: TREE, unifiedFileMeta: undefined } },
                        { selector: areaMetricSelector, value: "rloc" }
                    ]
                })
            ]
        })
        return { tree: TestBed.inject(MapExplorerTree), store: TestBed.inject(MockStore) }
    }

    function collectRootNodes(tree: MapExplorerTree, sortingOrder: SortingOption) {
        const rootNodes: CodeMapNode[] = []
        tree.rootNodeFor(sortingOrder, false).subscribe(rootNode => rootNodes.push(rootNode))
        return rootNodes
    }

    function pickAreaMetric(store: MockStore, areaMetric: string) {
        store.overrideSelector(areaMetricSelector, areaMetric)
        store.refreshState()
    }

    it("should sort the map's tree by name", async () => {
        // Arrange
        const { tree } = setup()

        // Act
        const rootNode = await firstValueFrom(tree.rootNodeFor(SortingOption.NAME, true))

        // Assert
        expect(rootNode.children.map(child => child.name)).toEqual(["a", "z"])
    })

    it("should sort by the area metric the metrics view picked", async () => {
        // Arrange
        const { tree } = setup()

        // Act
        const rootNode = await firstValueFrom(tree.rootNodeFor(SortingOption.AREA_SIZE, false))

        // Assert
        expect(rootNode.children.map(child => child.name)).toEqual(["z", "a"])
    })

    it("should leave the memoized tree untouched while sorting", async () => {
        // Arrange
        const { tree } = setup()

        // Act
        await firstValueFrom(tree.rootNodeFor(SortingOption.NAME, true))

        // Assert
        expect(TREE.children.map(child => child.name)).toEqual(["z", "a"])
    })

    it("should re-sort when the metrics view picks another area metric while sorting by area", () => {
        // Arrange
        const { tree, store } = setup()
        const rootNodes = collectRootNodes(tree, SortingOption.AREA_SIZE)

        // Act
        pickAreaMetric(store, "mcc")

        // Assert
        expect(rootNodes.map(rootNode => rootNode.children.map(child => child.name))).toEqual([
            ["z", "a"],
            ["a", "z"]
        ])
    })

    it("should keep the tree when the metrics view picks another area metric while not sorting by area", () => {
        // Arrange
        const { tree, store } = setup()
        const rootNodes = collectRootNodes(tree, SortingOption.NAME)

        // Act
        pickAreaMetric(store, "mcc")

        // Assert
        expect(rootNodes).toHaveLength(1)
    })
})
