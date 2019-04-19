import "./codeMap.module"
import "../../codeCharta"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CCFile, Settings } from "../../codeCharta.model"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { SETTINGS, TEST_FILE_WITH_PATHS } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "./codeMap.preRender.service";

describe("codeMapPreRenderService", () => {
	let codeMapPreRenderService: CodeMapPreRenderService
	let $rootScope: IRootScopeService
	let threeSceneService: ThreeSceneService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let codeMapRenderService: CodeMapRenderService
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
		codeMapRenderService = getService<CodeMapRenderService>("codeMapRenderService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
		file = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS))
	}

	function rebuildService() {
		codeMapPreRenderService = new CodeMapPreRenderService($rootScope, threeSceneService, threeOrbitControlsService, codeMapRenderService)
	}

	function withMockedCodeMapMesh() {
		codeMapMesh = new CodeMapMesh([], settings, false)
	}

	function withMockedEventMethods() {
		$rootScope.$on = codeMapPreRenderService["$rootScope"].$on = jest.fn()
		$rootScope.$broadcast = codeMapPreRenderService["$rootScope"].$broadcast = jest.fn()
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = codeMapPreRenderService["threeOrbitControlsService"] = jest.fn().mockReturnValue({
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

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})

		it("should call subscribe for MetricService", () => {
			rebuildService()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})
	})

	describe("getMapMesh", () => {
		it("should return _mapMesh via getter", () => {
			codeMapPreRenderService["_mapMesh"] = codeMapMesh

			const result = codeMapPreRenderService.mapMesh

			expect(result).toEqual(codeMapMesh)
		})
	})

	describe("getRenderFile", () => {
		it("should return lastRender.renderFile", () => {
			codeMapPreRenderService["lastRender"].renderFile = file

			const result = codeMapPreRenderService.getRenderFile()

			expect(result).toEqual(file)
		})
	})

	describe("onSettingsChanged", () => {
		it("should update lastRender.settings", () => {
			codeMapPreRenderService.onSettingsChanged(settings, undefined,undefined)

			expect(codeMapPreRenderService["lastRender"].settings).toEqual(settings)
		})
	})

	describe("subscribe", () => {
		it("should call $on", () => {
			CodeMapPreRenderService.subscribe($rootScope, undefined)

			expect($rootScope.$on).toHaveBeenCalled()
		})
	})
})