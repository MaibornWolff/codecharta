import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { CodeMapNode } from "../../../../codeCharta.model"
import { MapTreeViewModule } from "../mapTreeView.module"
import { MapTreeViewItemNameComponent } from "./mapTreeViewItemName.component"
import { provideMockStore } from "@ngrx/store/testing"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { rootUnarySelector } from "../../../../state/selectors/accumulatedData/rootUnary.selector"
import { searchedNodePathsSelector } from "../../../../state/selectors/searchedNodes/searchedNodePaths.selector"

describe("mapTreeViewItemNameComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MapTreeViewModule],
			providers: [
				provideMockStore({
					selectors: [
						{ selector: areaMetricSelector, value: "rloc" },
						{ selector: rootUnarySelector, value: 42 },
						{ selector: searchedNodePathsSelector, value: new Set() }
					]
				})
			]
		})
	})

	it("shouldn't have class 'noAreaMetric' when node's area metric is bigger than 0", async () => {
		const { container } = await render(MapTreeViewItemNameComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				node: { attributes: { rloc: 2 } } as unknown as CodeMapNode
			}
		})

		const nodeNameWrapper = container.querySelector(".node-name")
		expect(nodeNameWrapper.classList).not.toContain("noAreaMetric")
	})

	it("should have class 'noAreaMetric' when node's area metric is 0", async () => {
		const { container } = await render(MapTreeViewItemNameComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				node: { attributes: { rloc: 0 } } as unknown as CodeMapNode
			}
		})

		const nodeNameWrapper = container.querySelector(".node-name")
		expect(nodeNameWrapper.classList).toContain("noAreaMetric")
	})

	it("should have class 'noAreaMetric' when node's area metric doesn't exist", async () => {
		const { container } = await render(MapTreeViewItemNameComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				node: { attributes: {} } as unknown as CodeMapNode
			}
		})

		const nodeNameWrapper = container.querySelector(".node-name")
		expect(nodeNameWrapper.classList).toContain("noAreaMetric")
	})
})
