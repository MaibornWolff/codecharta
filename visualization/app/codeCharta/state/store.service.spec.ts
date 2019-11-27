import "./state.module"
import { StoreService } from "./store.service"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { BlacklistItem, BlacklistType } from "../codeCharta.model"
import { BlacklistAction, BlacklistActions } from "./store/fileSettings/blacklist/blacklist.actions"

describe("StoreService", () => {
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildService() {
		storeService = new StoreService($rootScope)
	}

	describe("constructor", () => {
		it("should initialize the store", () => {
			rebuildService()

			expect(storeService["store"]).not.toBeNull()
		})
	})

	describe("dispatch", () => {
		it("it should notify store change and update the store", () => {
			$rootScope.$broadcast = jest.fn()

			const item: BlacklistItem = { type: BlacklistType.exclude, path: "foo/bar" }
			const action: BlacklistAction = { type: BlacklistActions.ADD_BLACKLIST_ITEM, payload: item }

			storeService.dispatch(action)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("store-changed", { actionType: BlacklistActions.ADD_BLACKLIST_ITEM })
			expect(storeService.getState().fileSettings.blacklist).toEqual([item])
		})
	})
})
