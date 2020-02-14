import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { SearchedNodePathsAction, SearchedNodePathsActions } from "./searchedNodePaths.actions"
import { SearchedNodePathsService } from "./searchedNodePaths.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("SearchedNodePathsService", () => {
	let searchedNodePathsService: SearchedNodePathsService
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
		searchedNodePathsService = new SearchedNodePathsService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribeToFilesSelection to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, searchedNodePathsService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new searchedNodePaths value", () => {
			const action: SearchedNodePathsAction = {
				type: SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS,
				payload: ["myPath", "anotherPath"]
			}
			storeService["store"].dispatch(action)

			searchedNodePathsService.onStoreChanged(SearchedNodePathsActions.SET_SEARCHED_NODE_PATHS)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("searched-node-paths-changed", {
				searchedNodePaths: ["myPath", "anotherPath"]
			})
		})

		it("should not notify anything on non-searched-node-paths-events", () => {
			searchedNodePathsService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
