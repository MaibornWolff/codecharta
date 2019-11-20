import "./state.module"
import { StoreService } from "./store.service"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"

describe("StoreService", () => {
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		// initialise injected services and used variables
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildService() {
		storeService = new StoreService($rootScope)
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
