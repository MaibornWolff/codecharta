import "../../state.module"
import { IRootScopeService } from "angular"
import { addFile, FilesAction, FilesSelectionActions, NewFilesImportedActions } from "./files.actions"
import { FilesService } from "./files.service"
import { TEST_DELTA_MAP_A, withMockedEventMethods } from "../../../util/dataMocks"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { StoreService } from "../../store.service"
import { Files } from "../../../model/files"

describe("FilesService", () => {
	let filesService: FilesService
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
		filesService = new FilesService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribeToFilesSelection to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, filesService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers that the selection changed", () => {
			const action: FilesAction = {
				type: FilesSelectionActions.SET_SINGLE,
				payload: TEST_DELTA_MAP_A
			}
			storeService["store"].dispatch(action)

			filesService.onStoreChanged(FilesSelectionActions.SET_SINGLE)

			expect($rootScope.$broadcast).toBeCalledWith("files-selection-changed", { files: storeService.getState().files })
		})

		it("should not notify anything on non-files-events", () => {
			filesService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
