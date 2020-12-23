import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { LayoutAlgorithmAction, LayoutAlgorithmActions } from "./layoutAlgorithm.actions"
import { LayoutAlgorithmService } from "./layoutAlgorithm.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { LayoutAlgorithm } from "../../../../codeCharta.model"

describe("LayoutAlgorithmService", () => {
	let layoutAlgorithmService: LayoutAlgorithmService
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
		layoutAlgorithmService = new LayoutAlgorithmService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, layoutAlgorithmService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new layoutAlgorithm value", () => {
			const action: LayoutAlgorithmAction = {
				type: LayoutAlgorithmActions.SET_LAYOUT_ALGORITHM,
				payload: LayoutAlgorithm.StreetMap
			}
			storeService["store"].dispatch(action)

			layoutAlgorithmService.onStoreChanged(LayoutAlgorithmActions.SET_LAYOUT_ALGORITHM)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("layout-algorithm-changed", { layoutAlgorithm: LayoutAlgorithm.StreetMap })
		})

		it("should not notify anything on non-layout-algorithm-events", () => {
			layoutAlgorithmService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
