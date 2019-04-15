import "./codeMap.module"
import "../../codeCharta"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { TreeMapService } from "./treemap/treemap.service"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CCFile, Settings } from "../../codeCharta.model"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { SETTINGS, TEST_FILE_WITH_PATHS } from "../../util/dataMocks"

//TODO: Increase coverage later on and fix suite
describe("codeMapRenderService", () => {
	let codeMapRenderService: CodeMapRenderService
	let $rootScope: IRootScopeService
	let threeSceneService: ThreeSceneService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let treeMapService: TreeMapService
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
		treeMapService = getService<TreeMapService>("treeMapService")
		codeMapLabelService = getService<CodeMapLabelService>("codeMapLabelService")
		codeMapArrowService = getService<CodeMapArrowService>("codeMapArrowService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
		file = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS))
	}

	function rebuildService() {
		codeMapRenderService = new CodeMapRenderService($rootScope, threeSceneService, threeOrbitControlsService,
			treeMapService, codeMapLabelService, codeMapArrowService)
	}

	function withMockedCodeMapMesh() {
		codeMapMesh = new CodeMapMesh([], settings, false)
	}

	function withMockedEventMethods() {
		$rootScope.$on = codeMapRenderService["$rootScope"].$on = jest.fn()
		$rootScope.$broadcast = codeMapRenderService["$rootScope"].$broadcast = jest.fn()
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
			rebuildService()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, codeMapRenderService)
		})

		it("should call subscribe for MetricService", () => {
			rebuildService()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, codeMapRenderService)
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
	})

	describe("subscribe", () => {
		it("should call $on", () => {
			CodeMapRenderService.subscribe($rootScope, undefined)

			expect($rootScope.$on).toHaveBeenCalled()
		})
	})
})