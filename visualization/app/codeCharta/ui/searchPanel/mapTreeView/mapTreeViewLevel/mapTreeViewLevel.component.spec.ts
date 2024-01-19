import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import userEvent from "@testing-library/user-event"
import { TestBed } from "@angular/core/testing"
import { findByText, findByTitle, queryByText, queryByTitle, render, screen, waitFor } from "@testing-library/angular"

import { searchedNodePathsSelector } from "../../../../state/selectors/searchedNodes/searchedNodePaths.selector"
import { MapTreeViewModule } from "../mapTreeView.module"
import { MapTreeViewLevelComponent } from "./mapTreeViewLevel.component"
import { rootNode } from "./mocks"
import { defaultState } from "../../../../state/store/state.manager"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { rightClickedNodeDataSelector } from "../../../../../../app/codeCharta/state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import { hoveredNodeIdSelector } from "../../../../../../app/codeCharta/state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { mapColorsSelector } from "../../../../../../app/codeCharta/state/store/appSettings/mapColors/mapColors.selector"
import { defaultRightClickedNodeData } from "../../../../../../app/codeCharta/state/store/appStatus/rightClickedNodeData/rightClickedNodeData.reducer"
import { defaultHoveredNodeId } from "../../../../../../app/codeCharta/state/store/appStatus/hoveredNodeId/hoveredNodeId.reducer"
import { defaultMapColors } from "../../../../../../app/codeCharta/state/store/appSettings/mapColors/mapColors.reducer"
import { visibleFileStatesSelector } from "../../../../../../app/codeCharta/state/selectors/visibleFileStates.selector"
import { blacklistSelector } from "../../../../../../app/codeCharta/state/store/fileSettings/blacklist/blacklist.selector"
import { defaultBlacklist } from "../../../../../../app/codeCharta/state/store/fileSettings/blacklist/blacklist.reducer"
import { attributeTypesSelector } from "../../../../../../app/codeCharta/state/store/fileSettings/attributeTypes/attributeTypes.selector"
import { defaultAttributeTypes } from "../../../../../../app/codeCharta/state/store/fileSettings/attributeTypes/attributeTypes.reducer"
import { ThreeSceneService } from "../../../../../../app/codeCharta/ui/codeMap/threeViewer/threeSceneService"
import { CodeMapMouseEventService } from "../../../../../../app/codeCharta/ui/codeMap/codeMap.mouseEvent.service"
import { ThreeRendererService } from "../../../../../../app/codeCharta/ui/codeMap/threeViewer/threeRenderer.service"
import { IdToBuildingService } from "../../../../../../app/codeCharta/services/idToBuilding/idToBuilding.service"

describe("mapTreeViewLevel", () => {
	const componentProperties = {
		depth: 0,
		node: rootNode
	}

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MapTreeViewModule],
			providers: [
				provideMockStore({
					selectors: [
						{ selector: areaMetricSelector, value: "unary" },
						{ selector: visibleFileStatesSelector, value: [] },
						{ selector: blacklistSelector, value: defaultBlacklist },
						{ selector: mapColorsSelector, value: defaultMapColors },
						{ selector: hoveredNodeIdSelector, value: defaultHoveredNodeId },
						{ selector: searchedNodePathsSelector, value: new Set<string>() },
						{ selector: attributeTypesSelector, value: defaultAttributeTypes },
						{ selector: rightClickedNodeDataSelector, value: defaultRightClickedNodeData }
					]
				}),
				{ provide: State, useValue: { getValue: () => defaultState } },
				{
					provide: ThreeSceneService,
					useValue: {
						selectBuilding: jest.fn(),
						clearConstantHighlight: jest.fn(),
						resetLabel: jest.fn()
					}
				},
				{
					provide: IdToBuildingService,
					useValue: {
						get: jest.fn()
					}
				},
				{
					provide: ThreeRendererService,
					useValue: {
						render: jest.fn()
					}
				},
				{
					provide: CodeMapMouseEventService,
					useValue: {
						drawLabelSelectedBuilding: jest.fn(),
						setLabelHoveredLeaf: jest.fn(),
						hoverNode: jest.fn(),
						unhoverNode: jest.fn(),
						clearLabelHoveredBuilding: jest.fn()
					}
				}
			]
		})
	})

	afterEach(() => {
		jest.resetAllMocks()
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

		await userEvent.click(firstLevelFolder)
		await waitFor(() => {
			expect(firstLevelFolder.querySelector(".fa-folder-open")).toBeTruthy()
			expect(container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")).toBeTruthy()
		})
	})

	it("should display option buttons on hover", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		expect(firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")).toBeFalsy()

		await userEvent.hover(firstLevelFolder)

		await waitFor(() => expect(firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")).toBeTruthy())
	})

	it("should not display option buttons on hover when area metric is unavailable", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
		await userEvent.click(firstLevelFolder)

		const smallLeaf = container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf")

		await userEvent.hover(smallLeaf)

		await waitFor(() => expect(smallLeaf.querySelector("cc-map-tree-view-item-option-buttons")).toBeFalsy())
	})

	it("should show option button on hover and be marked after context menu was opened", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })

		const firstLevelFolder = queryByText(container as HTMLElement, /ParentLeaf/)
		const optionsButton = queryByText(firstLevelFolder, "Open Node-Context-Menu")

		await waitFor(() => expect(optionsButton).toBeFalsy())

		await userEvent.hover(firstLevelFolder)
		await waitFor(() => {
			expect(queryByText(firstLevelFolder, "Open Node-Context-Menu")).not.toBe(null)
		})

		await userEvent.click(optionsButton)

		const isMarked = container.querySelector("#\\/root\\/ParentLeaf.marked")
		await waitFor(() => expect(isMarked).toBeTruthy())
	})

	it("should display root unary percentage for folders and toggle to total unary on hover", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		await waitFor(() => expect(firstLevelFolder.textContent).toContain("%"))

		await userEvent.hover(firstLevelFolder)

		const parentLeaf = await findByText(container as HTMLElement, /ParentLeaf/)
		await waitFor(() => expect(parentLeaf.textContent).not.toContain("%"))
	})

	it("should make searched items 'tree-search-result'", async () => {
		searchedNodePathsSelectorMock.mockImplementationOnce(() => new Set(["/root/bigLeaf"]))
		const { container, detectChanges } = await render(MapTreeViewLevelComponent, {
			componentProperties,
			excludeComponentDeclaration: true
		})

		const store = TestBed.inject(MockStore)
		store.overrideSelector(searchedNodePathsSelector, new Set(["/root/bigLeaf"]))
		store.refreshState()
		detectChanges()

		await waitFor(() => {
			expect(queryByText(container as HTMLElement, /bigLeaf/).classList).toContain(".tree-search-result")
		})
	})

	it("should change text color to gray if node has no area metric", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
		await userEvent.click(firstLevelFolder)

		const smallLeaf = await findByText(container as HTMLElement, /smallLeaf/)
		await waitFor(() => expect(smallLeaf.classList).toContain("noAreaMetric"))
	})

	it("should change text color and stop displaying option buttons on hover when area metric is changed to not exist", async () => {
		const { container, detectChanges } = await render(MapTreeViewLevelComponent, {
			componentProperties,
			excludeComponentDeclaration: true
		})

		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
		await userEvent.hover(firstLevelFolder)

		await waitFor(() => expect(findByTitle(firstLevelFolder as HTMLElement, "Open Node-Context-Menu")).toBeTruthy())

		const store = TestBed.inject(MockStore)
		store.overrideSelector(areaMetricSelector, "mcc")
		store.refreshState()
		detectChanges()

		await userEvent.hover(firstLevelFolder)
		const span = await findByText(firstLevelFolder as HTMLElement, /ParentLeaf/)
		await waitFor(() => expect(queryByTitle(firstLevelFolder as HTMLElement, "Open Node-Context-Menu")).toBeFalsy())
		await waitFor(() => expect(span.classList).toContain("noAreaMetric"))
	})

	// it("should select the corresponding building on click of folder or file", async () => {})

	// it("should hover and unhover the corresponding building on hover and hover of folder or file", async () => {})
})
