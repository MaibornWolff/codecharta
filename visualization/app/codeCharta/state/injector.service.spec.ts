import "./state.module"
import { InjectorService } from "./injector.service"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"

describe("InjectorService", () => {
	let injectorService: InjectorService
	let blacklistService: BlacklistService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		blacklistService = getService<BlacklistService>("blacklistService")
	}

	function rebuildService() {
		injectorService = new InjectorService(blacklistService)
	}

	describe("constructor", () => {
		it("should rebuild injectorService", () => {
			rebuildService()

			expect(injectorService).toBeDefined()
		})

		it("should inject BlacklistService", () => {
			rebuildService()

			expect(blacklistService).toBeDefined()
		})
	})
})
