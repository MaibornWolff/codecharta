import "./threeViewer.module"
import { ThreeCameraService } from "./threeCameraService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { Settings } from "../../../codeCharta.model"
import { SETTINGS } from "../../../util/dataMocks"
import { PerspectiveCamera, Vector3 } from "three"
import { SettingsService } from "../../../state/settingsService/settings.service"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { StoreService } from "../../../state/store.service"

describe("ThreeCameraService", () => {
	let threeCameraService: ThreeCameraService
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let storeService: StoreService
	let settings: Settings

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildService() {
		threeCameraService = new ThreeCameraService($rootScope, storeService, settingsService)
		threeCameraService.camera = new PerspectiveCamera()
	}

	function withMockedSettingsService() {
		settingsService = threeCameraService["settingsService"] = jest.fn().mockReturnValue({
			updateSettings: jest.fn()
		})()
	}

	describe("onSettingsChanged", () => {
		beforeEach(() => {
			threeCameraService.setPosition = jest.fn()
		})

		it("should not call setPosition if camera and lastCameraVector are the same", () => {
			const vector = new Vector3(0, 300, 1000)
			threeCameraService["lastCameraVector"] = vector

			threeCameraService.onSettingsChanged(settings, undefined)

			expect(threeCameraService.setPosition).not.toHaveBeenCalled()
		})

		it("should call setPosition if camera and lastCameraVector are not the same", () => {
			threeCameraService.onSettingsChanged(settings, undefined)

			expect(threeCameraService.setPosition).toHaveBeenCalledWith(0, 300, 1000)
		})

		it("should set lastCameraVector if camera and lastCameraVector are not the same", () => {
			threeCameraService.onSettingsChanged(settings, undefined)

			expect(threeCameraService["lastCameraVector"]).toEqual(new Vector3(0, 300, 1000))
		})
	})

	describe("onCameraChanged", () => {
		it("should call updateSettings", () => {
			const cameraPosition = threeCameraService.camera.position

			threeCameraService.onCameraChanged(null)

			expect(settingsService.updateSettings).toHaveBeenCalledWith(
				{ appSettings: { camera: new Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z) } },
				true
			)
			expect(storeService.getState().appSettings.camera).toEqual(new Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z))
		})
	})

	describe("init", () => {
		beforeEach(() => {
			threeCameraService.setPosition = jest.fn()
			SettingsService.subscribe = jest.fn()
			ThreeOrbitControlsService.subscribe = jest.fn()
		})

		it("should set camera with a new aspect", () => {
			threeCameraService.init(400, 200, 1, 2, 3)

			expect(threeCameraService.camera.aspect).toBe(2)
		})

		it("should call setPosition with x, y and z", () => {
			threeCameraService.init(400, 200, 1, 2, 3)

			expect(threeCameraService.setPosition).toHaveBeenCalledWith(1, 2, 3)
		})

		it("should subscribe to SettingsService", () => {
			threeCameraService.init(400, 200, 1, 2, 3)

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, threeCameraService)
		})

		it("should subscribe to ThreeOrbitControlsService", () => {
			threeCameraService.init(400, 200, 1, 2, 3)

			expect(ThreeOrbitControlsService.subscribe).toHaveBeenCalledWith($rootScope, threeCameraService)
		})
	})

	describe("setPosition", () => {
		it("should set camera position correctly", () => {
			threeCameraService.setPosition(1, 2, 3)

			expect(threeCameraService.camera.position).toEqual({ x: 1, y: 2, z: 3 })
		})
	})
})
