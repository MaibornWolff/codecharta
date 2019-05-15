import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CCFile, Settings } from "../../codeCharta.model"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { SETTINGS, TEST_FILE_WITH_PATHS } from "../../util/dataMocks"

describe("codeMapRenderService", () => {
	let codeMapRenderService: CodeMapRenderService
	let threeSceneService: ThreeSceneService
	let codeMapLabelService: CodeMapLabelService
	let codeMapArrowService: CodeMapArrowService

	let codeMapMesh: CodeMapMesh
	let settings: Settings
	let file: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedCodeMapMesh()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		codeMapLabelService = getService<CodeMapLabelService>("codeMapLabelService")
		codeMapArrowService = getService<CodeMapArrowService>("codeMapArrowService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
		file = JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS))
	}

	function rebuildService() {
		codeMapRenderService = new CodeMapRenderService(threeSceneService, codeMapLabelService, codeMapArrowService)
	}

	function withMockedCodeMapMesh() {
		codeMapMesh = new CodeMapMesh([], settings, false)
	}

	describe("getMapMesh", () => {
		it("should return _mapMesh via getter", () => {
			codeMapRenderService["_mapMesh"] = codeMapMesh

			const result = codeMapRenderService.mapMesh

			expect(result).toEqual(codeMapMesh)
		})
	})
})
