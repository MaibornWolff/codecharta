import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { IsWhiteBackgroundAction, IsWhiteBackgroundActions } from "./isWhiteBackground.actions"
import { IsWhiteBackgroundService } from "./isWhiteBackground.service"

describe("IsWhiteBackgroundService", () => {
	let isWhiteBackgroundService: IsWhiteBackgroundService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		isWhiteBackgroundService = new IsWhiteBackgroundService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, isWhiteBackgroundService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new isWhiteBackground value", () => {
			const action: IsWhiteBackgroundAction = {
				type: IsWhiteBackgroundActions.SET_IS_WHITE_BACKGROUND,
				payload: true
			}
			storeService["store"].dispatch(action)

			isWhiteBackgroundService.onStoreChanged(IsWhiteBackgroundActions.SET_IS_WHITE_BACKGROUND)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("is-white-background-changed", { isWhiteBackground: true })
		})

		it("should not notify anything on non-is-white-background-events", () => {
			isWhiteBackgroundService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
