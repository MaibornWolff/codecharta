import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { pathsWithDependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { DependencyExplorerRow } from "./dependencyExplorerRow"

const LEAF_IN_GRAPH = { name: "a.ts", path: "/root/a.ts", id: 1, type: NodeType.FILE, attributes: {} } as unknown as CodeMapNode
const LEAF_OUTSIDE_GRAPH = { ...LEAF_IN_GRAPH, name: "b.md", path: "/root/b.md" } as CodeMapNode

describe("DependencyExplorerRow", () => {
    let row: DependencyExplorerRow

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DependencyExplorerRow,
                provideMockState(),
                provideMockStore({ selectors: [{ selector: pathsWithDependencyLevelsSelector, value: new Set([LEAF_IN_GRAPH.path]) }] })
            ]
        })
        row = TestBed.inject(DependencyExplorerRow)
    })

    it("should render a node the graph shows undimmed", () => {
        // Act
        const projection = row.project(LEAF_IN_GRAPH)

        // Assert
        expect(projection).toMatchObject({ isInactive: false, title: "" })
    })

    it("should grey out a node the graph has no box for", () => {
        // Act
        const projection = row.project(LEAF_OUTSIDE_GRAPH)

        // Assert
        expect(projection).toMatchObject({ isInactive: true, title: "Not in the dependency graph" })
    })

    it("should leave out an excluded node, as the graph does", () => {
        // Act
        const projection = row.project({ ...LEAF_IN_GRAPH, isExcluded: true })

        // Assert
        expect(projection.isHidden).toBe(true)
    })
})
