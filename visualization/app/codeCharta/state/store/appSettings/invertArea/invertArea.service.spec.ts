import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { InvertAreaAction, InvertAreaActions } from "./invertArea.actions"
import { InvertAreaService } from "./invertArea.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("InvertAreaService", () => {
	let invertAreaService: InvertAreaService
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
		invertAreaService = new InvertAreaService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, invertAreaService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new invertArea value", () => {
			const action: InvertAreaAction = {
				type: InvertAreaActions.SET_INVERT_AREA,
				payload: true
			}
			storeService["store"].dispatch(action)

			invertAreaService.onStoreChanged(InvertAreaActions.SET_INVERT_AREA)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("invert-area-changed", { invertArea: true })
		})

		it("should not notify anything on non-invert-area-events", () => {
			invertAreaService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
