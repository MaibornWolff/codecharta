import "./threeViewer.module"
import { ThreeCameraService } from "./threeCameraService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { PerspectiveCamera, Vector3 } from "three"
import { SettingsService } from "../../../state/settingsService/settings.service"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { StoreService } from "../../../state/store.service"
import { setCamera } from "../../../state/store/appSettings/camera/camera.actions"

describe("ThreeCameraService", () => {
	let threeCameraService: ThreeCameraService
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		threeCameraService = new ThreeCameraService($rootScope, storeService, settingsService)
		threeCameraService.camera = new PerspectiveCamera()
	}

	describe("onCameraChanged", () => {
		it("should call updateSettings", () => {
			const cameraPosition = threeCameraService.camera.position
			settingsService.updateSettings = jest.fn()

			threeCameraService.onCameraChanged(null)

			expect(settingsService.updateSettings).toHaveBeenCalledWith(
				{ appSettings: { camera: new Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z) } },
				true
			)
			expect(storeService.getState().appSettings.camera).toEqual(cameraPosition)
		})

		it("should not call storeService.notify method", () => {
			storeService["notify"] = jest.fn()

			threeCameraService.onCameraChanged(null)

			expect(storeService["notify"]).not.toHaveBeenCalled()
		})
	})

	describe("init", () => {
		beforeEach(() => {
			threeCameraService.setPosition = jest.fn()
			SettingsService.subscribe = jest.fn()
			ThreeOrbitControlsService.subscribe = jest.fn()
		})

		it("should set camera with a new aspect", () => {
			storeService.dispatch(setCamera(new Vector3(1, 2, 3)))

			threeCameraService.init(400, 200)

			expect(threeCameraService.camera.aspect).toBe(2)
		})

		it("should call setPosition with x, y and z", () => {
			threeCameraService.init(400, 200)

			expect(threeCameraService.setPosition).toHaveBeenCalled()
		})

		it("should subscribe to ThreeOrbitControlsService", () => {
			storeService.dispatch(setCamera(new Vector3(1, 2, 3)))

			threeCameraService.init(400, 200)

			expect(ThreeOrbitControlsService.subscribe).toHaveBeenCalledWith($rootScope, threeCameraService)
		})
	})

	describe("setPosition", () => {
		it("should set camera position correctly", () => {
			storeService.dispatch(setCamera(new Vector3(1, 2, 3)))

			threeCameraService.setPosition()

			expect(threeCameraService.camera.position).toEqual({ x: 1, y: 2, z: 3 })
		})
	})
})
