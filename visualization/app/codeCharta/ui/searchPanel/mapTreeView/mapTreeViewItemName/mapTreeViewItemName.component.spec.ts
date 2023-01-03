import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { CodeMapNode } from "../../../../codeCharta.model"
import { MapTreeViewModule } from "../mapTreeView.module"
import { MapTreeViewItemNameComponent } from "./mapTreeViewItemName.component"

jest.mock("../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector", () => ({
	areaMetricSelector: () => "rloc"
}))

describe("mapTreeViewItemNameComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MapTreeViewModule]
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
