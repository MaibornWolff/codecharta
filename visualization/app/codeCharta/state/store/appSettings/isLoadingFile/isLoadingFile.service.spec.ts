import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { IsLoadingFileAction, IsLoadingFileActions } from "./isLoadingFile.actions"
import { IsLoadingFileService } from "./isLoadingFile.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("IsLoadingFileService", () => {
	let isLoadingFileService: IsLoadingFileService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		isLoadingFileService = new IsLoadingFileService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, isLoadingFileService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new isLoadingFile value", () => {
			const action: IsLoadingFileAction = {
				type: IsLoadingFileActions.SET_IS_LOADING_FILE,
				payload: false
			}
			storeService["store"].dispatch(action)

			isLoadingFileService.onStoreChanged(IsLoadingFileActions.SET_IS_LOADING_FILE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("is-loading-file-changed", { isLoadingFile: false })
		})

		it("should not notify anything on non-is-loading-file-events", () => {
			isLoadingFileService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
