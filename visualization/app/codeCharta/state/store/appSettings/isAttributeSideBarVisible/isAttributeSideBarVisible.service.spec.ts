import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import {
	IsAttributeSideBarVisibleAction,
	IsAttributeSideBarVisibleActions,
	setIsAttributeSideBarVisible
} from "./isAttributeSideBarVisible.actions"
import { IsAttributeSideBarVisibleService } from "./isAttributeSideBarVisible.service"
import { CODE_MAP_BUILDING, withMockedEventMethods } from "../../../../util/dataMocks"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import _ from "lodash"

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

		it("should subscribe to Node Selected Events", () => {
			ThreeSceneService.subscribeToBuildingSelectedEvents = jest.fn()

			rebuildService()

			expect(ThreeSceneService.subscribeToBuildingSelectedEvents).toHaveBeenCalledWith($rootScope, isAttributeSideBarVisibleService)
		})

		it("should subscribe to Node Deselected Events", () => {
			ThreeSceneService.subscribeToBuildingDeselectedEvents = jest.fn()

			rebuildService()

			expect(ThreeSceneService.subscribeToBuildingDeselectedEvents).toHaveBeenCalledWith($rootScope, isAttributeSideBarVisibleService)
		})
	})

	describe("onBuildingSelected", () => {
		it("should set isAttributeSideBarVisible to true", () => {
			storeService.dispatch(setIsAttributeSideBarVisible(false))
			const codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)

			isAttributeSideBarVisibleService.onBuildingSelected(codeMapBuilding)

			expect(storeService.getState().appSettings.isAttributeSideBarVisible).toBeTruthy()
		})
	})

	describe("onBuildingDeselected", () => {
		it("should set isAttributeSideBarVisible to false", () => {
			storeService.dispatch(setIsAttributeSideBarVisible(true))

			isAttributeSideBarVisibleService.onBuildingDeselected()

			expect(storeService.getState().appSettings.isAttributeSideBarVisible).toBeFalsy()
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
