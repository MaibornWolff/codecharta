import "../../state.module"
import { IRootScopeService } from "angular"
import { FilesAction, FilesActions } from "./files.actions"
import { FilesService } from "./files.service"
import { withMockedEventMethods } from "../../../util/dataMocks"
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
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, filesService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new files value", () => {
			const files = new Files()
			const action: FilesAction = {
				type: FilesActions.SET_FILES,
				payload: files
			}
			storeService["store"].dispatch(action)

			filesService.onStoreChanged(FilesActions.SET_FILES)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("files-changed", { files })
		})

		it("should not notify anything on non-files-events", () => {
			filesService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
