import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { CameraAction, CameraActions } from "./camera.actions"
import { CameraService } from "./camera.service"
import { Vector3 } from "three"

describe("CameraService", () => {
	let cameraService: CameraService
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
		cameraService = new CameraService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, cameraService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new camera value", () => {
			const action: CameraAction = {
				type: CameraActions.SET_CAMERA,
				payload: new Vector3(0, 1, 2)
			}
			storeService["store"].dispatch(action)

			cameraService.onStoreChanged(CameraActions.SET_CAMERA)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("camera-changed", { camera: new Vector3(0, 1, 2) })
		})

		it("should not notify anything on non-camera-events", () => {
			cameraService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
