import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { CodeMapNode } from "../../../../codeCharta.model"
import { searchedNodePathsSelector } from "../../../../state/selectors/searchedNodes/searchedNodePaths.selector"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { ExplorerTreeItemNameComponent } from "./explorerTreeItemName.component"

describe("ExplorerTreeItemNameComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExplorerTreeItemNameComponent],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: searchedNodePathsSelector, value: new Set() }
                    ]
                })
            ]
        })
    })

    it("should not be opacity-50 when area metric is valid", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerTreeItemNameComponent, {
            inputs: { node: { path: "/x", attributes: { rloc: 2 } } as unknown as CodeMapNode }
        })

        // Assert
        expect(container.querySelector(".node-name")?.classList.contains("opacity-50")).toBe(false)
    })

    it("should be opacity-50 when area metric is zero", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerTreeItemNameComponent, {
            inputs: { node: { path: "/x", attributes: { rloc: 0 } } as unknown as CodeMapNode }
        })

        // Assert
        expect(container.querySelector(".node-name")?.classList.contains("opacity-50")).toBe(true)
    })

    it("should be highlighted as search-result when path is in searchedNodePaths", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [ExplorerTreeItemNameComponent],
            providers: [
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
})
