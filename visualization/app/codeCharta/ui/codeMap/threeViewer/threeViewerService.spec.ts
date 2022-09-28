import "./threeViewer.module"
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRenderer.service"
import { ThreeViewerService } from "./threeViewerService"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { ThreeStatsService } from "./threeStats.service"
import { CustomComposer } from "../rendering/postprocessor/customComposer"

describe("ThreeViewerService", () => {
	let threeViewerService: ThreeViewerService
	let threeSceneService: ThreeSceneService
	let threeCameraService: ThreeCameraService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let threeRendererService: ThreeRendererService
	let threeStatsService: ThreeStatsService

	let element: Element

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedElement()
		withMockedThreeCameraService()
		withMockedThreeRendererService()
		withMockedThreeOrbitControlsService()
		withMockedThreeStatsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		threeRendererService = getService<ThreeRendererService>("threeRendererService")
		threeStatsService = getService<ThreeStatsService>("threeStatsService")
	}

	function rebuildService() {
		threeViewerService = new ThreeViewerService(
			threeSceneService,
			threeCameraService,
			threeOrbitControlsService,
			threeRendererService,
			threeStatsService
		)
	}

	function mockThreeJs() {
		threeCameraService.camera = new PerspectiveCamera()
		threeCameraService.camera.lookAt = jest.fn()
		threeCameraService.camera.updateProjectionMatrix = jest.fn()
		threeRendererService.render = jest.fn()
		threeRendererService.renderer = { domElement: { height: 1, width: 1 } } as WebGLRenderer
		threeRendererService.renderer.setSize = jest.fn()
		threeRendererService.renderer.render = jest.fn()
		threeRendererService.renderer.dispose = jest.fn()
		threeRendererService.composer = { dispose: jest.fn() } as unknown as CustomComposer
		threeRendererService.renderer.getContext = jest.fn()
		threeRendererService.renderer.setPixelRatio = jest.fn()
		threeOrbitControlsService.controls = { enableKeys: null } as OrbitControls
		threeOrbitControlsService.controls.update = jest.fn()
		threeSceneService.scene = { position: new Vector3(1, 2, 3) } as Scene
		threeSceneService.scene.add = jest.fn()
		threeSceneService.scene.updateMatrixWorld = jest.fn()
		threeStatsService.updateStats = jest.fn()
		threeStatsService.destroy = jest.fn()
		window.addEventListener = jest.fn()
	}

	function withMockedElement() {
		element = jest.fn().mockReturnValue({ append: jest.fn() })()
	}

	function withMockedThreeCameraService() {
		threeCameraService = threeViewerService["threeCameraService"] = jest.fn().mockReturnValue({ init: jest.fn() })()
	}

	function withMockedThreeRendererService() {
		threeRendererService = threeViewerService["threeRendererService"] = jest.fn().mockReturnValue({ init: jest.fn() })()
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = threeViewerService["threeOrbitControlsService"] = jest.fn().mockReturnValue({ init: jest.fn() })()
	}

	function withMockedThreeStatsService() {
		threeStatsService = threeViewerService["threeStatsService"] = jest.fn().mockReturnValue({ init: jest.fn(), destroy: jest.fn() })()
	}

	describe("init", () => {
		beforeEach(() => {
			mockThreeJs()
		})

		it("should init threeCameraService", () => {
			threeViewerService.init(element)

			expect(threeCameraService.init).toHaveBeenCalledWith(1024, 768)
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

			expect(threeRendererService.init).toHaveBeenCalledWith(1024, 768, threeSceneService.scene, threeCameraService.camera)
		})

		it("should init threeOrbitControlsService", () => {
			threeViewerService.init(element)

			expect(threeOrbitControlsService.init).toHaveBeenCalledWith({ height: 1, width: 1 })
		})

		it("should call append", () => {
			threeViewerService.init(element)

			expect(element.append).toHaveBeenCalledWith({ height: 1, width: 1 })
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

		it("should call controls.update", () => {
			threeViewerService.animate()

			expect(threeOrbitControlsService.controls.update).toHaveBeenCalled()
		})

		it("should call update", () => {
			threeViewerService.animate()

			expect(threeRendererService.render).toHaveBeenCalled()
		})
	})

	describe("animateStats", () => {
		beforeEach(() => {
			mockThreeJs()
		})
		it("should call threeStatsService updateStats", () => {
			threeViewerService.animateStats()

			expect(threeStatsService.updateStats).toHaveBeenCalled()
		})
	})

	describe("getRenderCanvas", () => {
		beforeEach(() => {
			mockThreeJs()
		})
		it("should return dom element", () => {
			threeViewerService.getRenderCanvas()

			expect(threeRendererService.renderer.domElement).toEqual({ height: 1, width: 1 })
		})
	})

	describe("autoFitTo", () => {
		beforeEach(() => {
			mockThreeJs()
		})
		it("should call orbital control autoFitTo", () => {
			threeOrbitControlsService.autoFitTo = jest.fn()

			threeViewerService.autoFitTo()

			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
		})
	})

	describe("restart", () => {
		it("should restart the system", () => {
			threeViewerService.stopAnimate = jest.fn()
			threeViewerService.destroy = jest.fn()
			threeViewerService.init = jest.fn()
			threeViewerService.autoFitTo = jest.fn()
			threeViewerService.animate = jest.fn()
			threeViewerService.animateStats = jest.fn()

			threeViewerService.restart(element)
			expect(threeViewerService.stopAnimate).toHaveBeenCalled()
			expect(threeViewerService.destroy).toHaveBeenCalled()
			expect(threeViewerService.init).toHaveBeenCalled()
			expect(threeViewerService.autoFitTo).toHaveBeenCalled()
			expect(threeViewerService.animate).toHaveBeenCalled()
			expect(threeViewerService.animateStats).toHaveBeenCalled()
		})
	})

	describe("destroy", () => {
		beforeEach(() => {
			mockThreeJs()

			threeViewerService.getRenderCanvas = jest.fn().mockReturnValue({ remove: jest.fn() } as unknown as HTMLCanvasElement)
		})
		it("should call stats destroy", () => {
			threeViewerService.destroy()

			expect(threeStatsService.destroy).toHaveBeenCalled()
		})

		it("should call dispose", () => {
			threeViewerService.dispose = jest.fn()

			threeViewerService.destroy()

			expect(threeViewerService.dispose).toHaveBeenCalled()
		})
	})
})
