import "./state.module"
import { StoreService } from "./store.service"
import { getService, instantiateModule } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { BlacklistItem, BlacklistType } from "../codeCharta.model"
import { BlacklistAction, BlacklistActions } from "./store/fileSettings/blacklist/blacklist.actions"
import { withMockedEventMethods } from "../util/dataMocks"
import { setMargin } from "./store/dynamicSettings/margin/margin.actions"

describe("StoreService", () => {
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	describe("constructor", () => {
		it("should initialize the store", () => {
			expect(storeService["store"]).not.toBeNull()
		})
	})

	describe("dispatch", () => {
		it("should notify store change and update the store", () => {
			const item: BlacklistItem = { type: BlacklistType.exclude, path: "foo/bar" }
			const action: BlacklistAction = { type: BlacklistActions.ADD_BLACKLIST_ITEM, payload: item }

			storeService.dispatch(action)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("store-changed", {
				actionType: BlacklistActions.ADD_BLACKLIST_ITEM
			})
			expect(storeService.getState().fileSettings.blacklist).toEqual([item])
		})

		it("should update a single property", () => {
			storeService.dispatch(setMargin(20))

			expect(storeService.getState().dynamicSettings.margin).toEqual(20)
		})
	})
})
