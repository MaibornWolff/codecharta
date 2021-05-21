import "./screenshotButton.module"

import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { ScreenshotButtonController } from "./screenshotButton.component"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRendererService"

describe("resetSettingsButtonController", () => {
	let screenshotButtonController: ScreenshotButtonController
	let storeService: StoreService
	let threeSceneService: ThreeSceneService
	let threeCameraService: ThreeCameraService
	let threeRendererService: ThreeRendererService

	beforeEach(() => {
		restartSystem()
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
		it("should ", () => {
			screenshotButtonController.makeScreenshot()
			expect(screenshotButtonController["loadScript"]).toHaveBeenCalled()
		})
	})
})
