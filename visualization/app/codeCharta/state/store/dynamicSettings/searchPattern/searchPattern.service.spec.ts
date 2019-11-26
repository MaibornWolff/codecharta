import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { SearchPatternAction, SearchPatternActions } from "../../dynamicSettings/searchPattern/searchPattern.actions"
import { SearchPatternService } from "./searchPattern.service"

describe("SearchPatternService", () => {
	let searchPatternService: SearchPatternService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		searchPatternService = new SearchPatternService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, searchPatternService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new searchPattern value", () => {
			const action: SearchPatternAction = {
				type: SearchPatternActions.SET_SEARCH_PATTERN,
				payload: "mySearch/*.ts"
			}
			storeService["store"].dispatch(action)

			searchPatternService.onStoreChanged(SearchPatternActions.SET_SEARCH_PATTERN)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("search-pattern-changed", { searchPattern: "mySearch/*.ts" })
		})

		it("should not notify anything on non-search-pattern-events", () => {
			searchPatternService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
