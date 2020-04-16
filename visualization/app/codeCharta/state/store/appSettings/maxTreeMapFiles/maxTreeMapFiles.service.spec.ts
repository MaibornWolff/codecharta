import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { MaxTreeMapFilesAction, MaxTreeMapFilesActions } from "./maxTreeMapFiles.actions"
import { MaxTreeMapFilesService } from "./maxTreeMapFiles.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("MaxTreeMapFilesService", () => {
	let maxTreeMapFilesService: MaxTreeMapFilesService
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
		maxTreeMapFilesService = new MaxTreeMapFilesService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, maxTreeMapFilesService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new maxTreeMapFiles value", () => {
			const action: MaxTreeMapFilesAction = {
				type: MaxTreeMapFilesActions.SET_MAX_TREE_MAP_FILES,
				payload: 200
			}
			storeService["store"].dispatch(action)

			maxTreeMapFilesService.onStoreChanged(MaxTreeMapFilesActions.SET_MAX_TREE_MAP_FILES)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("max-tree-map-files-changed", { maxTreeMapFiles: 200 })
		})

		it("should not notify anything on non-max-tree-map-files-events", () => {
			maxTreeMapFilesService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
