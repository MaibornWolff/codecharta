import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ShowOnlyBuildingsWithEdgesAction, ShowOnlyBuildingsWithEdgesActions } from "./showOnlyBuildingsWithEdges.actions"
import { ShowOnlyBuildingsWithEdgesService } from "./showOnlyBuildingsWithEdges.service"

describe("ShowOnlyBuildingsWithEdgesService", () => {
	let showOnlyBuildingsWithEdgesService: ShowOnlyBuildingsWithEdgesService
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
		showOnlyBuildingsWithEdgesService = new ShowOnlyBuildingsWithEdgesService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, showOnlyBuildingsWithEdgesService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new showOnlyBuildingsWithEdges value", () => {
			const action: ShowOnlyBuildingsWithEdgesAction = {
				type: ShowOnlyBuildingsWithEdgesActions.SET_SHOW_ONLY_BUILDINGS_WITH_EDGES,
				payload: true
			}
			storeService["store"].dispatch(action)

			showOnlyBuildingsWithEdgesService.onStoreChanged(ShowOnlyBuildingsWithEdgesActions.SET_SHOW_ONLY_BUILDINGS_WITH_EDGES)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-only-buildings-with-edges-changed", {
				showOnlyBuildingsWithEdges: true
			})
		})

		it("should not notify anything on non-show-only-buildings-with-edges-events", () => {
			showOnlyBuildingsWithEdgesService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
