import "./threeViewer.module"
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"
import { SettingsService } from "../../../state/settingsService/settings.service"
import { ThreeViewerService } from "./threeViewerService"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { Settings } from "../../../codeCharta.model"
import { SETTINGS } from "../../../util/dataMocks"
import * as THREE from "three"
import { OrbitControls, Scene } from "three"

describe("ThreeViewerService", () => {
	let threeViewerService: ThreeViewerService
	let threeSceneService: ThreeSceneService
	let threeCameraService: ThreeCameraService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let threeRendererService: ThreeRendererService
	let threeUpdateCycleService: ThreeUpdateCycleService
	let settingsService: SettingsService

	let element: Element
	let settings: Settings

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedElement()
		withMockedThreeCameraService()
		withMockedSettingsService()
		withMockedThreeRendererService()
		withMockedThreeOrbitControlsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		threeRendererService = getService<ThreeRendererService>("threeRendererService")
		threeUpdateCycleService = getService<ThreeUpdateCycleService>("threeUpdateCycleService")
		settingsService = getService<SettingsService>("settingsService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildService() {
		threeViewerService = new ThreeViewerService(
			threeSceneService,
			threeCameraService,
			threeOrbitControlsService,
			threeRendererService,
			threeUpdateCycleService,
			settingsService
		)
	}

	function mockThreeJs() {
		threeCameraService.camera = new THREE.PerspectiveCamera()
		threeCameraService.camera.lookAt = jest.fn()
		threeCameraService.camera.updateProjectionMatrix = jest.fn()
		threeRendererService.renderer = { domElement: null } as THREE.WebGLRenderer
		threeRendererService.renderer.setSize = jest.fn()
		threeRendererService.renderer.render = jest.fn()
		threeOrbitControlsService.controls = { enableKeys: null } as OrbitControls
		threeOrbitControlsService.controls.update = jest.fn()
		threeUpdateCycleService.update = jest.fn()
		threeSceneService.scene = { position: new THREE.Vector3(1, 2, 3) } as Scene
		threeSceneService.scene.add = jest.fn()
		threeSceneService.scene.updateMatrixWorld = jest.fn()
		window.addEventListener = jest.fn()
	}

	function withMockedElement() {
		element = jest.fn().mockReturnValue({ appendChild: jest.fn() })()
	}

	function withMockedThreeCameraService() {
		threeCameraService = threeViewerService["threeCameraService"] = jest.fn().mockReturnValue({ init: jest.fn() })()
	}

	function withMockedSettingsService() {
		settingsService = threeViewerService["settingsService"] = jest
			.fn()
			.mockReturnValue({ getSettings: jest.fn().mockReturnValue(settings) })()
	}

	function withMockedThreeRendererService() {
		threeRendererService = threeViewerService["threeRendererService"] = jest.fn().mockReturnValue({ init: jest.fn() })()
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = threeViewerService["threeOrbitControlsService"] = jest.fn().mockReturnValue({ init: jest.fn() })()
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("init", () => {
		beforeEach(() => {
			mockThreeJs()
		})

		it("should init threeCameraService", () => {
			threeViewerService.init(element)

			expect(threeCameraService.init).toHaveBeenCalledWith(1024, 768, 0, 300, 1000)
		})

		it("should init threeCameraService", () => {
			threeViewerService.init(element)

			expect(threeCameraService.init).toHaveBeenCalledWith(1024, 768, 0, 300, 1000)
		})

		it("should call camera.lookAt", () => {
			threeViewerService.init(element)

			expect(threeCameraService.camera.lookAt).toHaveBeenCalledWith(threeSceneService.scene.position)
		})

		it("should call scene.add", () => {
			threeViewerService.init(element)

			expect(threeSceneService.scene.add).toHaveBeenCalledWith(threeCameraService.camera)
		})

		it("should init threeRendererService", () => {
			threeViewerService.init(element)

			expect(threeRendererService.init).toHaveBeenCalledWith(1024, 768)
		})

		it("should init threeOrbitControlsService", () => {
			threeViewerService.init(element)

			expect(threeOrbitControlsService.init).toHaveBeenCalledWith(null)
		})

		it("should call appendChild", () => {
			threeViewerService.init(element)

			expect(element.appendChild).toHaveBeenCalledWith(null)
		})

		it("should setup three event listeners", () => {
			threeViewerService.init(element)

			expect(window.addEventListener).toHaveBeenCalledTimes(3)
		})
	})

	describe("onWindowResize", () => {
		beforeEach(() => {
			mockThreeJs()
		})

		it("should call scene.updateMatrixWorld with false", () => {
			threeViewerService.onWindowResize()

			expect(threeSceneService.scene.updateMatrixWorld).toHaveBeenCalledWith(false)
		})

		it("should call renderer.setSize", () => {
			threeViewerService.onWindowResize()

			expect(threeRendererService.renderer.setSize).toHaveBeenCalledWith(1024, 768)
		})

		it("should set camera.aspect correctly", () => {
			threeViewerService.onWindowResize()

			expect(threeCameraService.camera.aspect).toBe(1024 / 768)
		})

		it("should call camera.updateProjectionMatrix", () => {
			threeViewerService.onWindowResize()

			expect(threeCameraService.camera.updateProjectionMatrix).toHaveBeenCalled()
		})
	})

	describe("onFocusIn", () => {
		beforeEach(() => {
			mockThreeJs()
			threeOrbitControlsService.controls.enableKeys = true
		})

		it("should set controls.enableKeys to true", () => {
			threeViewerService.onFocusIn({ target: { nodeName: "INPUT" } })

			expect(threeOrbitControlsService.controls.enableKeys).toBeFalsy()
		})

		it("should not set controls.enableKeys to true", () => {
			threeViewerService.onFocusIn({ target: { nodeName: "NOT_INPUT" } })

			expect(threeOrbitControlsService.controls.enableKeys).toBeTruthy()
		})
	})

	describe("onFocusOut", () => {
		beforeEach(() => {
			mockThreeJs()
			threeOrbitControlsService.controls.enableKeys = false
		})

		it("should set controls.enableKeys to true", () => {
			threeViewerService.onFocusOut({ target: { nodeName: "INPUT" } })

			expect(threeOrbitControlsService.controls.enableKeys).toBeTruthy()
		})

		it("should not set controls.enableKeys to true", () => {
			threeViewerService.onFocusOut({ target: { nodeName: "NOT_INPUT" } })

			expect(threeOrbitControlsService.controls.enableKeys).toBeFalsy()
		})
	})

	describe("animate", () => {
		beforeEach(() => {
			mockThreeJs()
		})

		it("should call renderer.render", () => {
			threeViewerService.animate()

			expect(threeRendererService.renderer.render).toHaveBeenCalledWith(threeSceneService.scene, threeCameraService.camera)
		})

		it("should call controls.update", () => {
			threeViewerService.animate()

			expect(threeOrbitControlsService.controls.update).toHaveBeenCalled()
		})

		it("should call update", () => {
			threeViewerService.animate()

			expect(threeUpdateCycleService.update).toHaveBeenCalled()
		})
	})
})
