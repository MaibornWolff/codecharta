import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { provideMockState } from "../../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import { searchedNodePathsSelector } from "../../../../renderer/renderModel/searchedNodes/searchedNodePaths.selector"
import { areaMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { ExplorerTreeItemNameComponent } from "./explorerTreeItemName.component"

describe("ExplorerTreeItemNameComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExplorerTreeItemNameComponent],
            providers: [
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: searchedNodePathsSelector, value: new Set() }
                    ]
                })
            ]
        })
    })

    it("should not be opacity-50 by default", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerTreeItemNameComponent, {
            inputs: { node: { path: "/x", attributes: { rloc: 2 } } as unknown as CodeMapNode }
        })

        // Assert
        expect(container.querySelector(".node-name")?.classList.contains("opacity-50")).toBe(false)
    })

    it("should be opacity-50 when the hosting view dims the row", async () => {
        // Arrange & Act — why a row is dimmed is the view's call, so it arrives as a plain flag
        const { container } = await render(ExplorerTreeItemNameComponent, {
            inputs: { node: { path: "/x", attributes: { rloc: 0 } } as unknown as CodeMapNode, isInactive: true }
        })

        // Assert
        expect(container.querySelector(".node-name")?.classList.contains("opacity-50")).toBe(true)
    })

    it("should be italic when the hosting view italicises the row", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerTreeItemNameComponent, {
            inputs: { node: { path: "/x", attributes: { rloc: 0 } } as unknown as CodeMapNode, isItalic: true }
        })

        // Assert
        expect(container.querySelector(".node-name")?.classList.contains("italic")).toBe(true)
    })

    it("should be highlighted as search-result when path is in searchedNodePaths", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [ExplorerTreeItemNameComponent],
            providers: [
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: searchedNodePathsSelector, value: new Set(["/needle"]) }
                    ]
                })
            ]
        })

        // Act
        const { container } = await render(ExplorerTreeItemNameComponent, {
            inputs: { node: { path: "/needle", attributes: { rloc: 1 } } as unknown as CodeMapNode }
        })

        // Assert
        expect(container.querySelector(".node-name")?.classList.contains("text-primary")).toBe(true)
    })

    it("should render the node name", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerTreeItemNameComponent, {
            inputs: { node: { name: "foo.ts", path: "/x", attributes: { rloc: 1 } } as unknown as CodeMapNode }
        })

        // Assert
        expect(container.textContent).toContain("foo.ts")
    })

    it("should line through a flattened file", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerTreeItemNameComponent, {
            inputs: { node: { path: "/x", type: NodeType.FILE, isFlattened: true, attributes: { rloc: 1 } } as unknown as CodeMapNode }
        })

        // Assert
        expect(container.querySelector(".node-name")?.classList.contains("line-through")).toBe(true)
    })

    it("should not line through a flattened folder", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerTreeItemNameComponent, {
            inputs: { node: { path: "/x", type: NodeType.FOLDER, isFlattened: true, attributes: { rloc: 1 } } as unknown as CodeMapNode }
        })

        // Assert
        expect(container.querySelector(".node-name")?.classList.contains("line-through")).toBe(false)
    })
})
