import "./codeMap.module"
import "../../codeCharta"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { TreeMapService } from "./treemap/treemap.service"
import { CodeMapUtilService } from "./codeMap.util.service"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CCFile, Settings } from "../../codeCharta.model"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"
import { SettingsService } from "../../state/settings.service"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { SETTINGS, TEST_FILE_WITH_PATHS } from "../../util/dataMocks"
import { NodeDecorator } from "../../util/nodeDecorator"

//TODO: Increase coverage later on and fix suite
describe("codeMapRenderService", () => {
	let codeMapRenderService: CodeMapRenderService
	let $rootScope
	let threeSceneService: ThreeSceneService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let threeCameraService: ThreeCameraService
	let treeMapService: TreeMapService
	let codeMapUtilService: CodeMapUtilService
	let codeMapLabelService: CodeMapLabelService
	let codeMapArrowService: CodeMapArrowService

	let codeMapMesh: CodeMapMesh
	let settings: Settings
	let file: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedCodeMapMesh()
		withMockedEventMethods()
		withMockedThreeOrbitControlsService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		treeMapService = getService<TreeMapService>("treeMapService")
		codeMapUtilService = getService<CodeMapUtilService>("codeMapUtilService")
		codeMapLabelService = getService<CodeMapLabelService>("codeMapLabelService")
		codeMapArrowService = getService<CodeMapArrowService>("codeMapArrowService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
		file = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS))
	}

	function rebuildService() {
		codeMapRenderService = new CodeMapRenderService($rootScope, threeSceneService, threeOrbitControlsService,
			threeCameraService, treeMapService, codeMapUtilService, codeMapLabelService, codeMapArrowService)
	}

	function withMockedCodeMapMesh() {
		codeMapMesh = new CodeMapMesh([], settings, false)
	}

	function withMockedEventMethods() {
		$rootScope = codeMapRenderService["$rootScope"] = jest.fn(() => {
			return {
				$on: jest.fn(),
				$broadcast: jest.fn()
			}
		})()
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = codeMapRenderService["threeOrbitControlsService"] = jest.fn().mockReturnValue({
			autoFitTo: jest.fn()
		})()
	}

	describe("constructor", () => {
		beforeEach(() => {
			FileStateService.subscribe = jest.fn()
			MetricService.subscribe = jest.fn()
		})

		it("should call subscribe for FileStateService", () => {
			codeMapRenderService = new CodeMapRenderService($rootScope, threeSceneService, threeOrbitControlsService,
				threeCameraService, treeMapService, codeMapUtilService, codeMapLabelService, codeMapArrowService)

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, codeMapRenderService)
		})

		it("should call subscribe for MetricService", () => {
			codeMapRenderService = new CodeMapRenderService($rootScope, threeSceneService, threeOrbitControlsService,
				threeCameraService, treeMapService, codeMapUtilService, codeMapLabelService, codeMapArrowService)

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, codeMapRenderService)
		})
	})

	describe("init", () => {
		it("should call subscribe for SettingsService", () => {
			SettingsService.subscribe = jest.fn()

			codeMapRenderService.init()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, codeMapRenderService)
		})
	})

	describe("getMapMesh", () => {
		it("should return _mapMesh via getter", () => {
			codeMapRenderService["_mapMesh"] = codeMapMesh

			const result = codeMapRenderService.mapMesh

			expect(result).toEqual(codeMapMesh)
		})
	})

	describe("getRenderFile", () => {
		it("should return lastRender.renderFile", () => {
			codeMapRenderService["lastRender"].renderFile = file

			const result = codeMapRenderService.getRenderFile()

			expect(result).toEqual(file)
		})
	})

	describe("onSettingsChanged", () => {
		it("should update lastRender.settings", () => {
			codeMapRenderService.onSettingsChanged(settings, undefined)

			expect(codeMapRenderService["lastRender"].settings).toEqual(settings)
		})

		it("should call decorateFile", () => {
			NodeDecorator.decorateFile = jest.fn()

			codeMapRenderService.onSettingsChanged(settings, undefined)

			expect(NodeDecorator.decorateFile).toHaveBeenCalledWith(codeMapRenderService["lastRender"].renderFile,
				codeMapRenderService["lastRender"].metricData)
		})

		it("should call autoFitTo if autoFitMap is true", () => {
			codeMapRenderService["autoFitMap"] = true

			codeMapRenderService.onSettingsChanged(settings, undefined)

			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
		})
	})

	describe("subscribe", () => {
		it("should call $on", () => {
			CodeMapRenderService.subscribe(undefined, undefined)

			expect($rootScope.$on).toHaveBeenCalled()
		})
	})
})