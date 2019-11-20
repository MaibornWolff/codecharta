import "./state.module"
import { StoreService } from "./store.service"
import { instantiateModule } from "../../../mocks/ng.mockhelper"

describe("StoreService", () => {
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		// initialise injected services and used variables
	}

	function rebuildService() {
		storeService = new StoreService()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
