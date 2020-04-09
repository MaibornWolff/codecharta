import "./treeMapStartDepth.module"
import { TreeMapStartDepthController } from "./treeMapStartDepth.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"

describe("TreeMapStartDepthController", () => {
	let $rootScope: IRootScopeService
	let storeService = getService<StoreService>("storeService")
	let treeMapStartDepthController: TreeMapStartDepthController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.treeMapStartDepth")
	}

	function rebuildController() {
		treeMapStartDepthController = new TreeMapStartDepthController($rootScope, storeService)
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
