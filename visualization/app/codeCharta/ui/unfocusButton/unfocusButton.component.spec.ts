import "./unfocusButton.module"
import { UnfocusButtonController } from "./unfocusButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FocusedNodePathService } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { focusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"

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
	}

	function rebuildController() {
		unfocusButtonController = new UnfocusButtonController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to FocusedNodePathService focus", () => {
			FocusedNodePathService.subscribeToFocusNode = jest.fn()

			rebuildController()

			expect(FocusedNodePathService.subscribeToFocusNode).toHaveBeenCalledWith($rootScope, unfocusButtonController)
		})
	})

	describe("onFocusNode", () => {
		it("should set focusedNodePath in viewModel", () => {
			unfocusButtonController.onFocusNode("/root")

			expect(unfocusButtonController["_viewModel"].isNodeFocused).toBeTruthy()
		})
	})

	describe("onUnfocusNode", () => {
		it("should set empty focusedNodePath in viewModel", () => {
			unfocusButtonController.onUnfocusNode()

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
