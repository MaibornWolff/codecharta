import "./mapTreeView.module"
import { MapTreeViewController } from "./mapTreeView.component"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeMapNode } from "../../codeCharta.model"
import { VALID_NODE_WITH_PATH } from "../../util/dataMocks"
import _ from "lodash"

describe("MapTreeViewController", () => {
	let mapTreeViewController: MapTreeViewController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let map: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.mapTreeView")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")

		map = _.cloneDeep(VALID_NODE_WITH_PATH)
	}

	function rebuildController() {
		mapTreeViewController = new MapTreeViewController($rootScope, $timeout)
	}

	describe("constructor", () => {
		it("should subscribe to CodeMapPreRenderService", () => {
			CodeMapPreRenderService.subscribe = jest.fn()

			rebuildController()

			expect(CodeMapPreRenderService.subscribe).toHaveBeenCalledWith($rootScope, mapTreeViewController)
		})
	})

	describe("onRenderMapChanged", () => {
		it("should update viewModel.rootNode after timeout", () => {
			mapTreeViewController["_viewModel"] = { rootNode: null }

			mapTreeViewController.onRenderMapChanged(map)
			$timeout.flush(100)

			expect(mapTreeViewController["_viewModel"].rootNode).toBe(map)
		})
	})
})
