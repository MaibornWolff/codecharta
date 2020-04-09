import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { IsAttributeSideBarVisibleAction, IsAttributeSideBarVisibleActions } from "./isAttributeSideBarVisible.actions"
import { IsAttributeSideBarVisibleService } from "./isAttributeSideBarVisible.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("IsAttributeSideBarVisibleService", () => {
	let isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService
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
		isAttributeSideBarVisibleService = new IsAttributeSideBarVisibleService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, isAttributeSideBarVisibleService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new isAttributeSideBarVisible value", () => {
			const action: IsAttributeSideBarVisibleAction = {
				type: IsAttributeSideBarVisibleActions.SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE,
				payload: true
			}
			storeService["store"].dispatch(action)

			isAttributeSideBarVisibleService.onStoreChanged(IsAttributeSideBarVisibleActions.SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("is-attribute-side-bar-visible-changed", { isAttributeSideBarVisible: true })
		})

		it("should not notify anything on non-is-attribute-side-bar-visible-events", () => {
			isAttributeSideBarVisibleService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
