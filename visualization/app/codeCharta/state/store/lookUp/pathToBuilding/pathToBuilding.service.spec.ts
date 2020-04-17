import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { PathToBuildingAction, PathToBuildingActions } from "./pathToBuilding.actions"
import { PathToBuildingService } from "./pathToBuilding.service"
import { CODE_MAP_BUILDING, withMockedEventMethods } from "../../../../util/dataMocks"

describe("PathToBuildingService", () => {
	let pathToBuildingService: PathToBuildingService
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
		pathToBuildingService = new PathToBuildingService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, pathToBuildingService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new pathToBuilding value", () => {
			const map = new Map()
			map.set(CODE_MAP_BUILDING.node.path, CODE_MAP_BUILDING)
			const action: PathToBuildingAction = {
				type: PathToBuildingActions.SET_PATH_TO_BUILDING,
				payload: map
			}
			storeService["store"].dispatch(action)

			pathToBuildingService.onStoreChanged(PathToBuildingActions.SET_PATH_TO_BUILDING)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("path-to-building-changed", { pathToBuilding: map })
		})

		it("should not notify anything on non-path-to-building-events", () => {
			pathToBuildingService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
