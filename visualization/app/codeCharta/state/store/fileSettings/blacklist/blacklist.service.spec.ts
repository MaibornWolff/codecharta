import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { BlacklistService } from "./blacklist.service"
import { BlacklistAction, BlacklistActions, setBlacklist } from "./blacklist.actions"
import { BlacklistItem, BlacklistType } from "../../../../codeCharta.model"
import { PresentationModeActions } from "../../appSettings/isPresentationMode/isPresentationMode.actions"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { FilesService } from "../../files/files.service"

describe("BlacklistService", () => {
	let blacklistService: BlacklistService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	const item: BlacklistItem = { type: BlacklistType.exclude, path: "foo/bar" }

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		storeService.dispatch(setBlacklist(), true)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		blacklistService = new BlacklistService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, blacklistService)
		})

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, blacklistService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new blacklist and show the loading gif", () => {
			const action: BlacklistAction = { type: BlacklistActions.ADD_BLACKLIST_ITEM, payload: item }
			storeService.dispatch(action, true)

			blacklistService.onStoreChanged(BlacklistActions.ADD_BLACKLIST_ITEM)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("blacklist-changed", { blacklist: [item] })
			expect(storeService.getState().appSettings.isLoadingMap).toBeTruthy()
		})

		it("should not notify anything on non-blacklist-events", () => {
			blacklistService.onStoreChanged(PresentationModeActions.SET_PRESENTATION_MODE)

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
