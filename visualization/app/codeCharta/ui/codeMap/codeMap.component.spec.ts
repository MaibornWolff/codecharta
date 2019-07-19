import "./codeMap.module"
import "../../codeCharta.module"
import { IRootScopeService, ITimeoutService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapController } from "./codeMap.component"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { LoadingGifService } from "../loadingGif/loadingGif.service"

describe("ColorSettingsPanelController", () => {
	let codeMapController: CodeMapController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let $element: Element
	let threeViewerService: ThreeViewerService
	let codeMapMouseEventService: CodeMapMouseEventService

	beforeEach(() => {
		restartSystem()
		mockElement()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		threeViewerService = getService<ThreeViewerService>("threeViewerService")
		codeMapMouseEventService = getService<CodeMapMouseEventService>("codeMapMouseEventService")
	}

	function mockElement() {
		$element = jest.fn<Element>(() => {
			return [
				{
					children: [
						{
							clientWidth: 50,
							clientHeight: 100
						}
					]
				}
			]
		})()
	}

	function rebuildController() {
		codeMapController = new CodeMapController($rootScope, $timeout, $element, threeViewerService, codeMapMouseEventService)
	}

	describe("constructor", () => {
		it("should subscribe to CodeMapMouseEventService", () => {
			CodeMapMouseEventService.subscribeToBuildingRightClickedEvents = jest.fn()

			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingRightClickedEvents).toHaveBeenCalledWith($rootScope, codeMapController)
		})

		it("should subscribe to LoadingGifService", () => {
			LoadingGifService.subscribe = jest.fn()

			rebuildController()

			expect(LoadingGifService.subscribe).toHaveBeenCalledWith($rootScope, codeMapController)
		})

		it("should set attribute isLoadingFile to true", () => {
			rebuildController()

			expect(codeMapController["_viewModel"].isLoadingFile).toBeTruthy()
		})
	})

	describe("onLoadingFileStatusChanged", () => {
		it("should set isLoadingFile in viewModel to true", () => {
			codeMapController.onLoadingFileStatusChanged(true, undefined)

			expect(codeMapController["_viewModel"].isLoadingFile).toBe(true)
		})

		it("should set isLoadingFile in viewModel to false", () => {
			codeMapController.onLoadingFileStatusChanged(false, undefined)

			expect(codeMapController["_viewModel"].isLoadingFile).toBe(false)
		})
	})
})
