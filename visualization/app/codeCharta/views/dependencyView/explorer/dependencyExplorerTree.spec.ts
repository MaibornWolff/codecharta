import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { CodeMapNode, NodeType, SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { DependencyExplorerTree } from "./dependencyExplorerTree"

const TREE = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: { unary: 3, rloc: 30 },
    children: [
        { name: "z", path: "/root/z", type: NodeType.FOLDER, attributes: { unary: 1, rloc: 20 }, children: [] },
        { name: "a", path: "/root/a", type: NodeType.FOLDER, attributes: { unary: 2, rloc: 10 }, children: [] }
    ]
} as CodeMapNode

describe("DependencyExplorerTree", () => {
    let tree: DependencyExplorerTree

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DependencyExplorerTree,
                provideMockStore({
                    selectors: [
                        { selector: accumulatedDataSelector, value: { unifiedMapNode: TREE, unifiedFileMeta: undefined } },
                        { selector: areaMetricSelector, value: "rloc" }
                    ]
                })
            ]
        })
        tree = TestBed.inject(DependencyExplorerTree)
    })

    it("should sort the map's tree by name", async () => {
        // Act
        const rootNode = await firstValueFrom(tree.rootNodeFor(SortingOption.NAME, true))

        // Assert
        expect(rootNode.children.map(child => child.name)).toEqual(["a", "z"])
    })

    it("should sort by the area metric the metrics view picked", async () => {
        // Act
        const rootNode = await firstValueFrom(tree.rootNodeFor(SortingOption.AREA_SIZE, false))

        // Assert
        expect(rootNode.children.map(child => child.name)).toEqual(["z", "a"])
    })

    it("should leave the memoized tree untouched while sorting", async () => {
        // Act
        await firstValueFrom(tree.rootNodeFor(SortingOption.NAME, true))

        // Assert
        expect(TREE.children.map(child => child.name)).toEqual(["z", "a"])
    })
})
