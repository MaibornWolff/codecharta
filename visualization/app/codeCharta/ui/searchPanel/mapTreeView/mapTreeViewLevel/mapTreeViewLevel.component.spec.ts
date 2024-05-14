import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { findByText, findByTitle, getByText, queryByText, queryByTitle, render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { IdToBuildingService } from "../../../../services/idToBuilding/idToBuilding.service"
import * as SearchedNodePathsSelector from "../../../../state/selectors/searchedNodes/searchedNodePaths.selector"
import * as VisibleFileStatesSelector from "../../../../state/selectors/visibleFileStates.selector"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import * as MapColorsSelector from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { setHoveredNodeId } from "../../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { defaultRightClickedNodeData } from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.reducer"
import * as RightClickedNodeDataSelector from "../../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import * as AreaMetricSelector from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { defaultAttributeTypes } from "../../../../state/store/fileSettings/attributeTypes/attributeTypes.reducer"
import * as AttributeTypesSelector from "../../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"
import { defaultBlacklist } from "../../../../state/store/fileSettings/blacklist/blacklist.reducer"
import * as BlacklistSelector from "../../../../state/store/fileSettings/blacklist/blacklist.selector"
import { appReducers, setStateMiddleware } from "../../../../state/store/state.manager"
import { CodeMapMouseEventService } from "../../../codeMap/codeMap.mouseEvent.service"
import { CodeMapBuilding } from "../../../codeMap/rendering/codeMapBuilding"
import { ThreeRendererService } from "../../../codeMap/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../../codeMap/threeViewer/threeSceneService"
import { MapTreeViewModule } from "../mapTreeView.module"
import { MapTreeViewLevelComponent } from "./mapTreeViewLevel.component"
import { rootNode } from "./mocks"

describe("mapTreeViewLevel", () => {
	const componentProperties = {
		depth: 0,
		node: rootNode
	}

	const labels = []

	const rootNodeId = componentProperties.node.id
	const parentLeafId = componentProperties.node.children.find(childNode => childNode.name === "ParentLeaf").id
	const bigLeafId = componentProperties.node.children.find(childNode => childNode.name === "bigLeaf").id
	const smallLeafId = componentProperties.node.children.find(childNode => childNode.name === "ParentLeaf").children[0].id

	const rootNodeBuilding = new CodeMapBuilding(rootNodeId, null, null, null)
	const parentLeafBuilding = new CodeMapBuilding(parentLeafId, null, null, null)
	const bigLeafBuilding = new CodeMapBuilding(bigLeafId, null, null, null)
	const smallLeafBuilding = new CodeMapBuilding(smallLeafId, null, null, null)

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MapTreeViewModule, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
			providers: [
				{
					provide: ThreeSceneService,
					useValue: {
						selectBuilding: jest.fn(),
						clearConstantHighlight: jest.fn(),
						resetLabel: jest.fn(),
						labels: { children: labels }
					}
				},
				{
					provide: IdToBuildingService,
					useValue: {
						get: jest.fn(id => {
							switch (id) {
								case rootNode:
									return rootNodeBuilding
								case parentLeafId:
									return parentLeafBuilding
								case bigLeafId:
									return bigLeafBuilding
								case smallLeafId:
									return smallLeafBuilding
							}
						})
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

		jest.spyOn(AreaMetricSelector, "areaMetricSelector").mockReturnValue("unary")
		jest.spyOn(VisibleFileStatesSelector, "visibleFileStatesSelector").mockReturnValue([])
		jest.spyOn(BlacklistSelector, "blacklistSelector").mockReturnValue(defaultBlacklist)
		jest.spyOn(MapColorsSelector, "mapColorsSelector").mockReturnValue(defaultMapColors)
		jest.spyOn(SearchedNodePathsSelector, "searchedNodePathsSelector").mockReturnValue(new Set<string>())
		jest.spyOn(AttributeTypesSelector, "attributeTypesSelector").mockReturnValue(defaultAttributeTypes)
		jest.spyOn(RightClickedNodeDataSelector, "rightClickedNodeDataSelector").mockReturnValue(defaultRightClickedNodeData)
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

		await waitFor(() => expect(getByText(container as HTMLElement, "smallLeaf")).toBeTruthy())
		await waitFor(() =>
			expect(
				container.querySelector("#\\/root\\/ParentLeaf\\/smallLeaf").querySelector("cc-map-tree-view-item-option-buttons")
			).toBeFalsy()
		)
	})

	it("should show option button on hover and be marked after context menu was opened", async () => {
		jest.spyOn(RightClickedNodeDataSelector, "rightClickedNodeDataSelector").mockReturnValue({
			nodeId: componentProperties.node.children.find(childNode => childNode.name === "ParentLeaf").id,
			xPositionOfRightClickEvent: null,
			yPositionOfRightClickEvent: null
		})

		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf") as HTMLElement

		await waitFor(() => expect(firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")).toBeFalsy())

		await userEvent.hover(firstLevelFolder)
		await waitFor(() => expect(firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons")).toBeTruthy())

		await userEvent.click(firstLevelFolder.querySelector("cc-map-tree-view-item-option-buttons"))

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
		jest.spyOn(SearchedNodePathsSelector, "searchedNodePathsSelector").mockReturnValue(new Set(["/root/bigLeaf"]))

		const { container } = await render(MapTreeViewLevelComponent, {
			componentProperties,
			excludeComponentDeclaration: true
		})

		await waitFor(() => {
			expect(queryByText(container as HTMLElement, /bigLeaf/).classList).toContain("tree-search-result")
		})
	})

	it("should change text color to gray if node has no area metric", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
		await userEvent.click(firstLevelFolder)

		await waitFor(() => expect(queryByText(container as HTMLElement, /smallLeaf/).classList).toContain("noAreaMetric"))
	})

	it("should change text color and stop displaying option buttons on hover when area metric is changed to not exist", async () => {
		jest.spyOn(AreaMetricSelector, "areaMetricSelector").mockReturnValue("mcc")

		const { container } = await render(MapTreeViewLevelComponent, {
			componentProperties,
			excludeComponentDeclaration: true
		})

		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")
		await userEvent.hover(firstLevelFolder)

		await waitFor(() => expect(findByTitle(firstLevelFolder as HTMLElement, "Open Node-Context-Menu")).toBeTruthy())

		await userEvent.hover(firstLevelFolder)
		const span = await findByText(firstLevelFolder as HTMLElement, /ParentLeaf/)
		await waitFor(() => expect(queryByTitle(firstLevelFolder as HTMLElement, "Open Node-Context-Menu")).toBeFalsy())
		await waitFor(() => expect(span.classList).toContain("noAreaMetric"))
	})

	it("should select the corresponding building on click of folder or file", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const codeMapMouseEventService = TestBed.inject(CodeMapMouseEventService)
		const threeSceneService = TestBed.inject(ThreeSceneService)
		const threeRendererService = TestBed.inject(ThreeRendererService)
		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		await userEvent.click(firstLevelFolder)
		await waitFor(() => {
			expect(codeMapMouseEventService.drawLabelSelectedBuilding).toHaveBeenCalledWith(parentLeafBuilding)
			expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(parentLeafBuilding)
			expect(threeSceneService.clearConstantHighlight).toHaveBeenCalledTimes(1)
			expect(threeRendererService.render).toHaveBeenCalledTimes(1)
		})
	})

	it("should hover and unhover the corresponding building on hover and unhover of folder or file", async () => {
		const { container } = await render(MapTreeViewLevelComponent, { componentProperties, excludeComponentDeclaration: true })
		const codeMapMouseEventService = TestBed.inject(CodeMapMouseEventService)
		const threeSceneService = TestBed.inject(ThreeSceneService)
		const store = TestBed.inject(Store)
		const dispatchSpy = jest.spyOn(store, "dispatch")

		const firstLevelFolder = container.querySelector("#\\/root\\/ParentLeaf")

		await userEvent.hover(firstLevelFolder)
		await waitFor(() => {
			expect(codeMapMouseEventService.setLabelHoveredLeaf).toHaveBeenCalledWith(parentLeafBuilding, labels)
			expect(codeMapMouseEventService.hoverNode).toHaveBeenCalledWith(parentLeafId)
			expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodeId({ value: parentLeafId }))
		})

		await userEvent.unhover(firstLevelFolder)

		await waitFor(() => {
			expect(threeSceneService.resetLabel).toHaveBeenCalledTimes(1)
			expect(codeMapMouseEventService.unhoverNode).toHaveBeenCalledTimes(1)
			expect(codeMapMouseEventService.clearLabelHoveredBuilding).toHaveBeenCalledTimes(1)
			expect(dispatchSpy).toHaveBeenCalledWith(setHoveredNodeId({ value: null }))
		})
	})
})
