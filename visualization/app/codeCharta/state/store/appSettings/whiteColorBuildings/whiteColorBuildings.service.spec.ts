import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { WhiteColorBuildingsAction, WhiteColorBuildingsActions } from "./whiteColorBuildings.actions"
import { WhiteColorBuildingsService } from "./whiteColorBuildings.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("WhiteColorBuildingsService", () => {
	let whiteColorBuildingsService: WhiteColorBuildingsService
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
		whiteColorBuildingsService = new WhiteColorBuildingsService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, whiteColorBuildingsService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new whiteColorBuildings value", () => {
			const action: WhiteColorBuildingsAction = {
				type: WhiteColorBuildingsActions.SET_WHITE_COLOR_BUILDINGS,
				payload: true
			}
			storeService["store"].dispatch(action)

			whiteColorBuildingsService.onStoreChanged(WhiteColorBuildingsActions.SET_WHITE_COLOR_BUILDINGS)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("white-color-buildings-changed", { whiteColorBuildings: true })
		})

		it("should not notify anything on non-white-color-buildings-events", () => {
			whiteColorBuildingsService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
