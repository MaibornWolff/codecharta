import "./unfocusButton.module"
import { UnfocusButtonController } from "./unfocusButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { focusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { TEST_DELTA_MAP_A } from "../../util/dataMocks"
import { setIdToNode } from "../../state/store/lookUp/idToNode/idToNode.actions"
import { NodeDecorator } from "../../util/nodeDecorator"
import { FocusedNodePathService } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.service"

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
		NodeDecorator.decorateMap(
			TEST_DELTA_MAP_A.map,
			{
				nodeMetricData: [],
				edgeMetricData: []
			},
			[]
		)
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
		it("should subscribe to focus node", () => {
			FocusedNodePathService.subscribeToFocusNode = jest.fn()

			rebuildController()

			expect(FocusedNodePathService.subscribeToFocusNode).toHaveBeenCalledWith($rootScope, unfocusButtonController)
		})
	})

	describe("on focus node", () => {
		it("should add the node to focusedNodes", function () {
			unfocusButtonController.onFocusNode("/root/app")
			expect(unfocusButtonController["_viewModel"].focusedNodes.length).toBeGreaterThan(0)
		})
		it("should not add the node to focusedNodes", function () {
			unfocusButtonController.onFocusNode("/root/app")
			unfocusButtonController.onFocusNode("/root/app")
			expect(unfocusButtonController["_viewModel"].focusedNodes.length).toBe(1)

			unfocusButtonController.onFocusNode("")
			expect(unfocusButtonController["_viewModel"].focusedNodes.length).toBe(1)
		})
	})

	describe("removeFocusedNode", () => {
		it("should apply previous focusedNodePath in storeService", () => {
			unfocusButtonController["_viewModel"].focusedNodes = ["/root", "/root/app"]
			storeService.dispatch(focusNode("/root/app"))

			unfocusButtonController.removeFocusedNode()

			expect(unfocusButtonController["_viewModel"].focusedNodes.length).toBe(1)
			expect(unfocusButtonController["_viewModel"].focusedNodes).toEqual(["/root"])
		})

		it("should clear focusedNodePath in storeService", () => {
			unfocusButtonController["_viewModel"].focusedNodes = ["/root", "/root/app"]
			storeService.dispatch(focusNode("/root/app"))

			unfocusButtonController.removeFocusedNode(true)

			expect(unfocusButtonController["_viewModel"].focusedNodes.length).toBe(0)
			expect(storeService.getState().dynamicSettings.focusedNodePath).toBe("")
		})
	})

	describe("onIsLoadingFileChanged", () => {
		it("should clear focusedNodes", () => {
			unfocusButtonController["_viewModel"].focusedNodes = ["/root", "/root/app"]

			unfocusButtonController.onIsLoadingFileChanged(true)

			expect(unfocusButtonController["_viewModel"].isLoadingFile).toBe(true)
			expect(unfocusButtonController["_viewModel"].focusedNodes).toEqual([])
		})
	})
})
