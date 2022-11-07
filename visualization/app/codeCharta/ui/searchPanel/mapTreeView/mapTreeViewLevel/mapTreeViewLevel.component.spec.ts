import { TestBed } from "@angular/core/testing"
import { render, screen, fireEvent } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"

import { searchedNodePathsSelector } from "../../../../state/selectors/searchedNodes/searchedNodePaths.selector"
import { Store } from "../../../../state/store/store"
import { MapTreeViewModule } from "../mapTreeView.module"
import { MapTreeViewLevelComponent } from "./mapTreeViewLevel.component"
import { rootNode } from "./mocks"
import { setAreaMetric } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"

jest.mock("../../../../state/selectors/searchedNodes/searchedNodePaths.selector", () => ({
	searchedNodePathsSelector: jest.fn(
		jest.requireActual("../../../../state/selectors/searchedNodes/searchedNodePaths.selector").searchedNodePathsSelector
	)
}))
const searchedNodePathsSelectorMock = searchedNodePathsSelector as unknown as jest.Mock<ReturnType<typeof searchedNodePathsSelector>>

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
		Store.dispatch(setAreaMetric("unary"))
	})

	it("should show root and first level folder and files initially", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })

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
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		expect(firstLevelFolder).toBeTruthy()
		expect(firstLevelFolder.querySelector(".fa-folder")).toBeTruthy()
		expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeFalsy()

		fireEvent.click(firstLevelFolder)
		expect(firstLevelFolder.querySelector(".fa-folder-open")).toBeTruthy()
		expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeTruthy()
	})

	it("should display option buttons on hover", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		expect(firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")).toBeFalsy()

		await userEvent.hover(firstLevelFolder)

		expect(firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")).toBeTruthy()
	})

	it("should not display option buttons on hover when area metric is zero", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
		fireEvent.click(firstLevelFolder)

		const smallLeaf = container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")

		await userEvent.hover(smallLeaf)

		expect(smallLeaf.querySelector("cc-map-tree-view-item-option-buttons")).toBeFalsy()
	})

	it("should show option button on hover and be marked after context menu was opened", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })

		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
		let optionsButton = firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")
		expect(optionsButton).toBe(null)

		await userEvent.hover(firstLevelFolder)
		optionsButton = firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")
		expect(optionsButton).not.toBe(null)
		fireEvent.click(optionsButton.querySelector("[title='Open Node-Context-Menu']"))

		const isMarked = container.querySelector("#\\/root\\/ParentLeaf.marked")
		expect(isMarked).toBeTruthy()
	})

	it("should display root unary percentage for folders and toggle to total unary on hover", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		const showsPercentage = firstLevelFolder.textContent.includes("%")
		expect(showsPercentage).toBe(true)

		await userEvent.hover(firstLevelFolder)

		const showsPercentageAfterHover = firstLevelFolder.textContent.includes("%")
		expect(showsPercentageAfterHover).toBe(false)
	})

	it("should make searched items 'angular-green'", async () => {
		searchedNodePathsSelectorMock.mockImplementationOnce(() => new Set(["/root/bigLeaf"]))
		const { container, detectChanges } = await render(MapTreeViewLevelComponent, {
			componentProperties,
			excludeComponentDeclaration: true
		})

		detectChanges()

		const bigLeaf = container.querySelector("#\\/root\\/bigLeaf")
		const isAngularGreen = bigLeaf.querySelector(".angular-green")
		expect(isAngularGreen).toBeTruthy()
	})

	it("should change text color to gray if node has no area metric", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
		fireEvent.click(firstLevelFolder)

		const smallLeaf = container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")

		expect(smallLeaf.querySelector(".noAreaMetric")).toBeTruthy()
	})
})
