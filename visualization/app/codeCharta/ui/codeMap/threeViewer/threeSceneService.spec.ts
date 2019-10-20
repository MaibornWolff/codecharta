import "./threeViewer.module"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { SettingsService } from "../../../state/settingsService/settings.service"
import { VALID_NODE, CODE_MAP_BUILDING } from "../../../util/dataMocks"
import { CodeMapNode, CodeMapBuilding } from "../../../codeCharta.model"
import { ThreeSceneService } from "./threeSceneService"
import { IRootScopeService } from "angular"
import _ from "lodash"

describe("ThreeSceneService", () => {
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let map: CodeMapNode
	let codeMapBuilding: CodeMapBuilding

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")

		map = _.cloneDeep(VALID_NODE)
		codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
	}

	function rebuildService() {
		threeSceneService = new ThreeSceneService($rootScope, settingsService)
	}

	describe("onRenderMapChanged", () => {
		it("should call reselectBuilding", () => {
			threeSceneService["selected"] = codeMapBuilding
			threeSceneService.reselectBuilding = jest.fn()

			threeSceneService.onRenderMapChanged(map)

			expect(threeSceneService.reselectBuilding).toHaveBeenCalled()
		})

		it("should not call reselectBuilding", () => {
			threeSceneService["selected"] = null
			threeSceneService.reselectBuilding = jest.fn()

			threeSceneService.onRenderMapChanged(map)

			expect(threeSceneService.reselectBuilding).not.toHaveBeenCalled()
		})
	})
})
