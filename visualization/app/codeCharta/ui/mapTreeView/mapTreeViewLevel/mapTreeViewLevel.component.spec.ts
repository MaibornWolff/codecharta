import { TestBed } from "@angular/core/testing"
import { render, screen, fireEvent } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setSearchedNodePaths } from "../../../state/store/dynamicSettings/searchedNodePaths/searchedNodePaths.actions"
import { Store } from "../../../state/store/store"

import { NodeContextMenuController } from "../../nodeContextMenu/nodeContextMenu.component"
import { MapTreeViewModule } from "../mapTreeView.module"
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
			imports: [MapTreeViewModule]
		})

		Store["initialize"]()
	})

	it("should show root and first level folder and files initially", async () => {
		const { container } = await render(MapTreeViewLevel, { componentProperties, excludeComponentDeclaration: true })

		expect(container.getElementsByClassName("tree-element-0").length).toBe(1)
		expect(screen.getByText("root")).toBeTruthy()

		expect(container.getElementsByClassName("tree-element-1").length).toBe(2)
		expect(screen.getByText("bigLeaf")).toBeTruthy()
		expect(screen.getByText("ParentLeaf")).toBeTruthy()

		const isBigLeafRenderedAsFile = container.querySelector("#\\/root\\/bigLeaf .fa-file-o")
		expect(isBigLeafRenderedAsFile).toBeTruthy()
		const isParentLeafRenderedAsFolder = container.querySelector("#\\/root\\/ParentLeaf .fa-folder")
		expect(isParentLeafRenderedAsFolder).toBeTruthy()
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

		userEvent.hover(firstLevelFolder)
		const optionsButton = firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")
		fireEvent.click(optionsButton.querySelector("[title='Open Node-Context-Menu']"))

		expect(nodeContextMenuSpy).toHaveBeenCalled()
		const argumentsToNodeContextMenu = nodeContextMenuSpy.mock.calls[0]
		expect(argumentsToNodeContextMenu[1]).toBe("/root/ParentLeaf")
		expect(argumentsToNodeContextMenu[2]).toBe("Folder")

		const isMarked = container.querySelector("#\\/root\\/ParentLeaf.marked")
		expect(isMarked).toBeTruthy()
	})

	it("should display root unary percentage for folders and toggle to total unary on hover", async () => {
		const { container } = await render(MapTreeViewLevel, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		const showsPercentage = firstLevelFolder.textContent.includes("%")
		expect(showsPercentage).toBe(true)

		userEvent.hover(firstLevelFolder)

		const showsPercentageAfterHover = firstLevelFolder.textContent.includes("%")
		expect(showsPercentageAfterHover).toBe(false)
	})

	it("should make searched items 'angular-green'", async () => {
		const { container, detectChanges } = await render(MapTreeViewLevel, { componentProperties, excludeComponentDeclaration: true })

		Store.store.dispatch(setSearchedNodePaths(new Set(["/root/bigLeaf"])))
		detectChanges()

		const bigLeaf = container.querySelector("#\\/root\\/bigLeaf")
		const isAngularGreen = bigLeaf.querySelector(".angular-green")
		expect(isAngularGreen).toBeTruthy()
	})
})
