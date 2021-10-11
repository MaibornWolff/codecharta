import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"

import { MapTreeViewLevelModule } from "../mapTreeViewLevel.module"
import { MapTreeViewLevel } from "./mapTreeViewLevel.component"
import { rootNode } from "./mocks"

jest.mock("../../nodeContextMenu/nodeContextMenu.component", () => ({
	NodeContextMenuController: {
		subscribeToHideNodeContextMenu: () => {
			console.log("subscribeToHideNodeContextMenu calleeeeeeeeeeeeeeeeeeeeeeeeeed")
		}
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

	it("should render all levels", async () => {
		await render(MapTreeViewLevel, {
			componentProperties,
			excludeComponentDeclaration: true
		})
		expect(screen.getByText("root")).toBeTruthy()
	})
})
