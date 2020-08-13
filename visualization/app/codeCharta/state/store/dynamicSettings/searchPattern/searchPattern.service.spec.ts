import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { SearchPatternAction, SearchPatternActions, setSearchPattern } from "./searchPattern.actions"
import { SearchPatternService } from "./searchPattern.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { FilesService } from "../../files/files.service"

describe("SearchPatternService", () => {
	let searchPatternService: SearchPatternService
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
		searchPatternService = new SearchPatternService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, searchPatternService)
		})

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, searchPatternService)
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

			expect($rootScope.$broadcast).toHaveBeenCalledWith("search-pattern-changed", {
				searchPattern: "mySearch/*.ts"
			})
		})

		it("should not notify anything on non-search-pattern-events", () => {
			searchPatternService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should reset and set empty searchPattern", () => {
			storeService.dispatch(setSearchPattern("some/search.pattern*"))

			searchPatternService.onFilesSelectionChanged()

			expect(storeService.getState().dynamicSettings.searchPattern).toEqual("")
		})
	})
})
