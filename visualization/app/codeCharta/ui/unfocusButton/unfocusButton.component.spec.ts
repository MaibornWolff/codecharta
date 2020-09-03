import "./unfocusButton.module"
import { UnfocusButtonController } from "./unfocusButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { focusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { CODE_MAP_BUILDING, TEST_DELTA_MAP_A } from "../../util/dataMocks"
import { setIdToNode } from "../../state/store/lookUp/idToNode/idToNode.actions"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { NodeDecorator } from "../../util/nodeDecorator"

describe("UnfocusButtonController", () => {
	let unfocusButtonController: UnfocusButtonController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.unfocusButton")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")

		NodeDecorator.decorateMapWithPathAttribute(TEST_DELTA_MAP_A)
		NodeDecorator.decorateMap(TEST_DELTA_MAP_A.map, [])
		const map = new Map([
			[TEST_DELTA_MAP_A.map.children[0].id, TEST_DELTA_MAP_A.map.children[0]],
			[TEST_DELTA_MAP_A.map.children[1].id, TEST_DELTA_MAP_A.map.children[1]],
			[TEST_DELTA_MAP_A.map.children[1].children[0].id, TEST_DELTA_MAP_A.map.children[1].children[0]]
		])
		storeService.dispatch(setIdToNode(map))
	}

	function rebuildController() {
		unfocusButtonController = new UnfocusButtonController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to building-right-clicked-event", () => {
			CodeMapMouseEventService.subscribeToBuildingRightClickedEvents = jest.fn()

			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingRightClickedEvents).toHaveBeenCalledWith($rootScope, unfocusButtonController)
		})
	})

	describe("onBuildingRightClicked", () => {
		it("should show the unfocus button when the focusedNodePath equals the right-clicked-buildings path", () => {
			storeService.dispatch(focusNode(TEST_DELTA_MAP_A.map.children[0].path))
			CODE_MAP_BUILDING.node.id = TEST_DELTA_MAP_A.map.children[0].id
			CODE_MAP_BUILDING.node.path = TEST_DELTA_MAP_A.map.children[0].path

			unfocusButtonController.onBuildingRightClicked(CODE_MAP_BUILDING)

			expect(unfocusButtonController["_viewModel"].isNodeFocused).toBeTruthy()
			expect(unfocusButtonController["_viewModel"].isParentFocused).toBeFalsy()
		})

		it("should show the unfocus parent button when right-clicking a child of the focused node", () => {
			storeService.dispatch(focusNode(TEST_DELTA_MAP_A.map.children[1].path))
			CODE_MAP_BUILDING.node.id = TEST_DELTA_MAP_A.map.children[1].children[0].id
			CODE_MAP_BUILDING.node.path = TEST_DELTA_MAP_A.map.children[1].children[0].path

			unfocusButtonController.onBuildingRightClicked(CODE_MAP_BUILDING)

			expect(unfocusButtonController["_viewModel"].isParentFocused).toBeTruthy()
			expect(unfocusButtonController["_viewModel"].isNodeFocused).toBeFalsy()
		})
	})

	describe("removeFocusedNode", () => {
		it("should apply empty focusedNodePath in storeService", () => {
			storeService.dispatch(focusNode("/root"))

			unfocusButtonController.removeFocusedNode()

			expect(storeService.getState().dynamicSettings.focusedNodePath).toBe("")
		})
	})
})
