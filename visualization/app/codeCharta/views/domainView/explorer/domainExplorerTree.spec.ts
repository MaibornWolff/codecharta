import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { viewIndependentTreeSelector } from "../../../lenses/structure/structure.facade"
import { CodeMapNode, NodeType, SortingOption } from "../../../model/codeCharta.model"
import { DomainExplorerTree } from "./domainExplorerTree"

const TREE = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: { unary: 3 },
    children: [
        { name: "z", path: "/root/z", type: NodeType.FOLDER, attributes: { unary: 2 }, children: [] },
        { name: "a", path: "/root/a", type: NodeType.FOLDER, attributes: { unary: 1 }, children: [] }
    ]
} as CodeMapNode

describe("DomainExplorerTree", () => {
    let tree: DomainExplorerTree

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DomainExplorerTree, provideMockStore({ selectors: [{ selector: viewIndependentTreeSelector, value: TREE }] })]
        })
        tree = TestBed.inject(DomainExplorerTree)
    })

    it("should sort the view-independent tree by name", async () => {
        // Act
        const rootNode = await firstValueFrom(tree.rootNodeFor(SortingOption.NAME, true))

        // Assert
        expect(rootNode.children.map(child => child.name)).toEqual(["a", "z"])
    })

    it("should sort by the file counts of the view-independent tree, which no blacklist can skew", async () => {
        // Act
        const rootNode = await firstValueFrom(tree.rootNodeFor(SortingOption.NUMBER_OF_FILES, false))

        // Assert
        expect(rootNode.children.map(child => child.name)).toEqual(["z", "a"])
    })

    it("should leave the memoized selector result untouched while sorting", async () => {
        // Act
        await firstValueFrom(tree.rootNodeFor(SortingOption.NAME, true))

        // Assert
        expect(TREE.children.map(child => child.name)).toEqual(["z", "a"])
    })
})
