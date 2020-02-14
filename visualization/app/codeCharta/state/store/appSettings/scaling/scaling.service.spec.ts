import "../../../state.module"
import { Vector3 } from "three"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ScalingAction, ScalingActions } from "./scaling.actions"
import { ScalingService } from "./scaling.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("ScalingService", () => {
	let scalingService: ScalingService
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
		scalingService = new ScalingService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribeToFilesSelection to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, scalingService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new scaling value", () => {
			const action: ScalingAction = {
				type: ScalingActions.SET_SCALING,
				payload: new Vector3(2, 2, 2)
			}
			storeService["store"].dispatch(action)

			scalingService.onStoreChanged(ScalingActions.SET_SCALING)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("scaling-changed", { scaling: new Vector3(2, 2, 2) })
		})

		it("should not notify anything on non-scaling-events", () => {
			scalingService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
