import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { BlacklistService } from "./blacklist.service"
import { addBlacklistItem, BlacklistAction, BlacklistActions, setBlacklist } from "./blacklist.actions"
import { BlacklistItem, BlacklistType } from "../../../../codeCharta.model"
import { PresentationModeActions } from "../../appSettings/isPresentationMode/isPresentationMode.actions"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { FilesService } from "../../files/files.service"
import { CodeMapPreRenderService } from "../../../../ui/codeMap/codeMap.preRender.service"
import { DialogService } from "../../../../ui/dialog/dialog.service"
import { NodeDecorator } from "../../../../util/nodeDecorator"

describe("BlacklistService", () => {
	let blacklistService: BlacklistService
	let storeService: StoreService
	let $rootScope: IRootScopeService
	let codeMapPreRenderService: CodeMapPreRenderService
	let dialogService: DialogService

	const item: BlacklistItem = { type: BlacklistType.exclude, path: "foo/bar" }

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		withMockedErrorDialog()
		storeService.dispatch(setBlacklist(), true)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
		dialogService = getService<DialogService>("dialogService")
	}

	function rebuildService() {
		blacklistService = new BlacklistService($rootScope, storeService, codeMapPreRenderService, dialogService)
	}

	function withMockedErrorDialog() {
		dialogService.showErrorDialog = jest.fn()
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
			NodeDecorator.doesExclusionResultInEmptyMap = jest.fn().mockReturnValue(false)

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

		it("should not notify when the new blacklist entry would result in an empty map. Instead remove the last entry silently and display an error", () => {
			NodeDecorator.doesExclusionResultInEmptyMap = jest.fn().mockReturnValue(true)

			storeService.dispatch(addBlacklistItem(item), true)

			blacklistService.onStoreChanged(BlacklistActions.ADD_BLACKLIST_ITEM)

			expect($rootScope.$broadcast).not.toHaveBeenCalledWith("blacklist-changed", { blacklist: [item] })
			expect(storeService.getState().fileSettings.blacklist).toHaveLength(0)
			expect(dialogService.showErrorDialog).toHaveBeenCalled()
		})
	})
})
