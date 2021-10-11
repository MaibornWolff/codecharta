import { TestBed } from "@angular/core/testing"
import { render, screen, fireEvent } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"

import { NodeContextMenuController } from "../../nodeContextMenu/nodeContextMenu.component"
import { MapTreeViewLevelModule } from "../mapTreeViewLevel.module"
import { MapTreeViewLevel } from "./mapTreeViewLevel.component"
import { rootNode } from "./mocks"

jest.mock("../../nodeContextMenu/nodeContextMenu.component", () => ({
	NodeContextMenuController: {
		subscribeToHideNodeContextMenu: () => {},
		broadcastShowEvent: jest.fn()
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
		const { container } = await render(MapTreeViewLevel, { componentProperties, excludeComponentDeclaration: true })

		expect(container.getElementsByClassName("tree-element-0").length).toBe(1)
		expect(screen.getByText("root")).toBeTruthy()

		expect(container.getElementsByClassName("tree-element-1").length).toBe(2)
		expect(screen.getByText("bigLeaf")).toBeTruthy()
		expect(screen.getByText("ParentLeaf")).toBeTruthy()
	})

	it("should render first level folder closed initially and open it on click", async () => {
		const { container } = await render(MapTreeViewLevel, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		expect(firstLevelFolder).toBeTruthy()
		expect(firstLevelFolder.querySelector(".fa-folder")).toBeTruthy()
		expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeFalsy()

		fireEvent.click(firstLevelFolder)
		expect(firstLevelFolder.querySelector(".fa-folder-open")).toBeTruthy()
		expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeTruthy()
	})

	it("should display option buttons on hover", async () => {
		const { container } = await render(MapTreeViewLevel, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		expect(firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")).toBeFalsy()

		userEvent.hover(firstLevelFolder)

		expect(firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")).toBeTruthy()
	})

	it("should open nodeContextMenu when options button clicked and be marked afterwards", async () => {
		const nodeContextMenuSpy = jest.spyOn(NodeContextMenuController, "broadcastShowEvent")

		const { container } = await render(MapTreeViewLevel, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
		const optionsButton = firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")
		userEvent.hover(firstLevelFolder)
		fireEvent.click(optionsButton.querySelector("[title='Open Node-Context-Menu']"))

		expect(nodeContextMenuSpy).toHaveBeenCalled()
		const argumentsToNodeContextMenu = nodeContextMenuSpy.mock.calls[0]
		expect(argumentsToNodeContextMenu[1]).toBe("/root/ParentLeaf")
		expect(argumentsToNodeContextMenu[2]).toBe("Folder")

		const isMarked = container.querySelector("#\\/root\\/ParentLeaf.marked")
		expect(isMarked).toBeTruthy()
	})
})
