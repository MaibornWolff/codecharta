import "./codeMap.module"
import "../../codeCharta.module"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapController } from "./codeMap.component"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { IsLoadingFileService } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"

describe("ColorSettingsPanelController", () => {
	let codeMapController: CodeMapController
	let $rootScope: IRootScopeService
	let $element: Element
	let threeViewerService: ThreeViewerService
	let codeMapMouseEventService: CodeMapMouseEventService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		mockElement()
		withMockedThreeViewerService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		threeViewerService = getService<ThreeViewerService>("threeViewerService")
		codeMapMouseEventService = getService<CodeMapMouseEventService>("codeMapMouseEventService")
	}

	function mockElement() {
		// @ts-ignore we only care about few properties for the tests.
		$element = [{ children: [{ clientWidth: 50, clientHeight: 100 }] }]
	}

	function withMockedThreeViewerService() {
		threeViewerService = codeMapController["threeViewerService"] = jest.fn().mockReturnValue({
			destroy: jest.fn(),
			animate: jest.fn(),
			stopAnimate: jest.fn(),
			autoFitTo: jest.fn(),
			animateStats: jest.fn(),
			dispose: jest.fn()
		})()
	}

	function rebuildController() {
		codeMapController = new CodeMapController($rootScope, $element, threeViewerService, codeMapMouseEventService)
		codeMapController.$postLink = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to IsLoadingFileService", () => {
			IsLoadingFileService.subscribe = jest.fn()

			rebuildController()

			expect(IsLoadingFileService.subscribe).toHaveBeenCalledWith($rootScope, codeMapController)
		})

		it("should set attribute isLoadingFile to true", () => {
			rebuildController()

			expect(codeMapController["_viewModel"].isLoadingFile).toBeTruthy()
		})
	})

	describe("onIsLoadingFileChanged", () => {
		it("should set isLoadingFile in viewModel to true", () => {
			codeMapController.onIsLoadingFileChanged(true)

			expect(codeMapController["_viewModel"].isLoadingFile).toBe(true)
		})

		it("should set isLoadingFile in viewModel to false", () => {
			codeMapController.onIsLoadingFileChanged(false)

			expect(codeMapController["_viewModel"].isLoadingFile).toBe(false)
		})
	})

	describe("onSharpnessModeChanged", () => {
		const sharpnessTests = [
			{ func: "stopAnimate" },
			{ func: "destroy" },
			{ func: "autoFitTo" },
			{ func: "animate" },
			{ func: "animateStats" }
		]
		beforeEach(() => {
			codeMapController.onSharpnessModeChanged()
		})

		for (const test of sharpnessTests) {
			it(`should call threeViewerService ${test.func}`, () => {
				expect(threeViewerService[`${test.func}`]).toHaveBeenCalled()
			})
		}

		it("should call CodeMapController $postLink", () => {
			expect(codeMapController.$postLink).toHaveBeenCalled()
		})
	})
})
