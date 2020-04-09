import "./layoutSelection.module"
import { LayoutSelectionController } from "./layoutSelection.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"

describe("LayoutSelectionController", () => {
	let $rootScope: IRootScopeService
	let storeService = getService<StoreService>("storeService")
	let layoutSelectionController: LayoutSelectionController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.layoutSelection")
	}

	function rebuildController() {
		layoutSelectionController = new LayoutSelectionController($rootScope, storeService)
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
