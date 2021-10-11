import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"

import { MapTreeViewLevelModule } from "../mapTreeViewLevel.module"
import { MapTreeViewLevel } from "./mapTreeViewLevel.component"
import { rootNode } from "./mocks"

jest.mock("../../nodeContextMenu/nodeContextMenu.component", () => ({
	NodeContextMenuController: {
		subscribeToHideNodeContextMenu: () => {}
	}
}))

describe("mapTreeViewLevel", () => {
	const componentProperties = {
		depth: 0,
		node: rootNode
	}

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MapTreeViewLevelModule]
		})
	})

	it("should show root and first level items initially", async () => {
		const { container } = await render(MapTreeViewLevel, {
			componentProperties,
			excludeComponentDeclaration: true
		})

		expect(container.getElementsByClassName("tree-element-0").length).toBe(1)
		expect(screen.getByText("root")).toBeTruthy()

		expect(container.getElementsByClassName("tree-element-1").length).toBe(2)
		expect(screen.getByText("big leaf")).toBeTruthy()
		expect(screen.getByText("Parent Leaf")).toBeTruthy()
	})
})
