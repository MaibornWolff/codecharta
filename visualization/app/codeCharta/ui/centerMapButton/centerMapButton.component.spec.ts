import "./centerMapButton.module"
import { CenterMapButtonController } from "./centerMapButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { IRootScopeService } from "angular"
import { PerspectiveCamera, Vector3 } from "three"

describe("CenterMapButtonController", () => {
	let centerMapButtonController: CenterMapButtonController
	let threeOrbitControlsService: ThreeOrbitControlsService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedThreeOrbitControlsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.centerMapButton")

		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildController() {
		centerMapButtonController = new CenterMapButtonController($rootScope, threeOrbitControlsService)
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = centerMapButtonController["threeOrbitControlsService"] = jest.fn().mockReturnValue({
			autoFitTo: jest.fn()
		})()
	}

	describe("constructor", () => {
		it("should subscribe to ThreeOrbitControlsService", () => {
			ThreeOrbitControlsService.subscribe = jest.fn()

			rebuildController()

			expect(ThreeOrbitControlsService.subscribe).toHaveBeenCalledWith($rootScope, centerMapButtonController)
		})
	})

	describe("fitMapToView", () => {
		it("should call autoFitTo", () => {
			threeOrbitControlsService.autoFitTo = jest.fn()
			centerMapButtonController.fitMapToView()

			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
		})
	})

	describe("onCameraChanged", () => {
		it("should return true if new camera position is the same", () => {
			threeOrbitControlsService["defaultCameraPosition"] = new Vector3(1, 2, 3)
			const camera = new PerspectiveCamera()
			camera.position.set(1, 2, 3)

			centerMapButtonController.onCameraChanged(camera)

			expect(centerMapButtonController["_viewModel"].isMapCentered).toBeTruthy()
		})

		it("should return false if new camera position is the not same", () => {
			threeOrbitControlsService["defaultCameraPosition"] = new Vector3(1, 2, 3)
			const camera = new PerspectiveCamera()
			camera.position.set(1, 2, 4)

			centerMapButtonController.onCameraChanged(camera)

			expect(centerMapButtonController["_viewModel"].isMapCentered).toBeFalsy()
		})
	})
})
