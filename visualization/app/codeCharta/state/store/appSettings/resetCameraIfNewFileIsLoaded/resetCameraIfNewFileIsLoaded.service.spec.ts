import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import {
	ResetCameraIfNewFileIsLoadedAction,
	ResetCameraIfNewFileIsLoadedActions
} from "./resetCameraIfNewFileIsLoaded.actions"
import { ResetCameraIfNewFileIsLoadedService } from "./resetCameraIfNewFileIsLoaded.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("ResetCameraIfNewFileIsLoadedService", () => {
	let resetCameraIfNewFileIsLoadedService: ResetCameraIfNewFileIsLoadedService
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
		resetCameraIfNewFileIsLoadedService = new ResetCameraIfNewFileIsLoadedService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, resetCameraIfNewFileIsLoadedService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new resetCameraIfNewFileIsLoaded value", () => {
			const action: ResetCameraIfNewFileIsLoadedAction = {
				type: ResetCameraIfNewFileIsLoadedActions.SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED,
				payload: false
			}
			storeService["store"].dispatch(action)

			resetCameraIfNewFileIsLoadedService.onStoreChanged(
				ResetCameraIfNewFileIsLoadedActions.SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED
			)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("reset-camera-if-new-file-is-loaded-changed", {
				resetCameraIfNewFileIsLoaded: false
			})
		})

		it("should not notify anything on non-reset-camera-if-new-file-is-loaded-events", () => {
			resetCameraIfNewFileIsLoadedService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
