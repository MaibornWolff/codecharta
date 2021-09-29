import "../../../state.module"

import { ScreenshotToClipboardEnabledService } from "./screenshotToClipboardEnabled.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ScreenshotToClipboardEnabledAction, ScreenshotToClipboardEnabledActions } from "./screenshotToClipboardEnabled.actions"

describe("ScreenshotToClipboardEnabledService", () => {
	let screenshotToClipboardEnabledService: ScreenshotToClipboardEnabledService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		screenshotToClipboardEnabledService = new ScreenshotToClipboardEnabledService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, screenshotToClipboardEnabledService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new screenshotToClipboardEnabled value", () => {
			const action: ScreenshotToClipboardEnabledAction = {
				type: ScreenshotToClipboardEnabledActions.SET_SCREENSHOT_TO_CLIPBOARD_ENABLED,
				payload: true
			}
			storeService["store"].dispatch(action)

			screenshotToClipboardEnabledService.onStoreChanged(ScreenshotToClipboardEnabledActions.SET_SCREENSHOT_TO_CLIPBOARD_ENABLED)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("clipboard-enabled-changed", {
				screenshotToClipboardEnabled: true
			})
		})

		it("should not notify anything on non-clipboard-enabled-events", () => {
			screenshotToClipboardEnabledService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
