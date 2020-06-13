import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { CameraTargetAction, CameraTargetActions } from "./cameraTarget.actions"
import { CameraTargetService } from "./cameraTarget.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { Vector3 } from "three"

describe("CameraTargetService", () => {
	let cameraTargetService: CameraTargetService
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
		cameraTargetService = new CameraTargetService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, cameraTargetService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new cameraTarget value", () => {
			const action: CameraTargetAction = {
				type: CameraTargetActions.SET_CAMERA_TARGET,
				payload: new Vector3(100, 100, 100)
			}
			storeService["store"].dispatch(action)

			cameraTargetService.onStoreChanged(CameraTargetActions.SET_CAMERA_TARGET)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("camera-target-changed", { cameraTarget: new Vector3(100, 100, 100) })
		})

		it("should not notify anything on non-camera-target-events", () => {
			cameraTargetService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
