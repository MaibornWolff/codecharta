import "./screenshotButton.module"

import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { ScreenshotButtonController } from "./screenshotButton.component"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRendererService"
import { Scene, WebGLRenderer } from "three"

describe("resetSettingsButtonController", () => {
	let screenshotButtonController: ScreenshotButtonController
	let storeService: StoreService
	let threeSceneService: ThreeSceneService
	let threeCameraService: ThreeCameraService
	let threeRendererService: ThreeRendererService

	function mockLoadScript() {
		threeRendererService.renderer = { domElement: { height: 1, width: 1 } } as WebGLRenderer
		threeRendererService.renderer.setPixelRatio = jest.fn()
		threeRendererService.renderer.getClearColor = jest.fn()
		threeRendererService.renderer.setClearColor = jest.fn()
		threeRendererService.renderer.render = jest.fn()
		threeRendererService.renderer.domElement.toDataURL = jest.fn()
		threeSceneService.scene = { background: null } as Scene
	}

	beforeEach(() => {
		restartSystem()
		mockLoadScript()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.screenshotButton")

		storeService = getService<StoreService>("storeService")
		threeSceneService = getService<ThreeSceneService>("storeService")
		threeCameraService = getService<ThreeCameraService>("storeService")
		threeRendererService = getService<ThreeRendererService>("storeService")
	}

	function rebuildController() {
		screenshotButtonController = new ScreenshotButtonController(
			threeSceneService,
			threeCameraService,
			threeRendererService,
			storeService
		)
	}

	describe("makeScreenshot", () => {
		it("should call loadScript", () => {
			screenshotButtonController["loadScript"] = jest.fn()
			screenshotButtonController.makeScreenshot()
			expect(screenshotButtonController["loadScript"]).toBeCalled()
		})
		it("should call makePNGFileName", () => {
			screenshotButtonController["makePNGFileName"] = jest.fn()
			screenshotButtonController.makeScreenshot()
			expect(screenshotButtonController["makePNGFileName"]).toBeCalled()
		})
	})
})
