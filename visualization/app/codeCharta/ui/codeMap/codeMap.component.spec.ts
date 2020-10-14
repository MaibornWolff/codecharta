import "./codeMap.module"
import "../../codeCharta.module"
import { IRootScopeService, ITimeoutService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapController } from "./codeMap.component"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { IsLoadingFileService } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"
import { StoreService } from "../../state/store.service"
import { PanelSelection, SearchPanelMode } from "../../codeCharta.model"
import { setSearchPanelMode } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { setPanelSelection } from "../../state/store/appSettings/panelSelection/panelSelection.actions"

describe("ColorSettingsPanelController", () => {
	let codeMapController: CodeMapController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let $element: Element
	let storeService: StoreService
	let threeViewerService: ThreeViewerService
	let codeMapMouseEventService: CodeMapMouseEventService
	let codeChartaMouseEventService: CodeChartaMouseEventService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		mockElement()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		storeService = getService<StoreService>("storeService")
		threeViewerService = getService<ThreeViewerService>("threeViewerService")
		codeMapMouseEventService = getService<CodeMapMouseEventService>("codeMapMouseEventService")
		codeChartaMouseEventService = getService<CodeChartaMouseEventService>("codeChartaMouseEventService")
	}

	function mockElement() {
		$element = [{ children: [{ clientWidth: 50, clientHeight: 100 }] }] as any
	}

	function rebuildController() {
		codeMapController = new CodeMapController(
			$rootScope,
			$timeout,
			$element,
			threeViewerService,
			codeMapMouseEventService,
			codeChartaMouseEventService
		)
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

	describe("onClick", () => {
		it("should minimize all panels", () => {
			storeService.dispatch(setSearchPanelMode(SearchPanelMode.exclude))
			storeService.dispatch(setPanelSelection(PanelSelection.AREA_PANEL_OPEN))

			codeMapController.onClick()

			const { appSettings } = storeService.getState()

			expect(appSettings.searchPanelMode).toEqual(SearchPanelMode.minimized)
			expect(appSettings.panelSelection).toEqual(PanelSelection.NONE)
		})
	})
})
