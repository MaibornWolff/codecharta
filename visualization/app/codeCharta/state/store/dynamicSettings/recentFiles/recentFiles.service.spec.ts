import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { RecentFilesAction, RecentFilesActions } from "./recentFiles.actions"
import { RecentFilesService } from "./recentFiles.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("RecentFilesService", () => {
	let recentFilesService: RecentFilesService
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
		recentFilesService = new RecentFilesService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, recentFilesService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new recentFiles value", () => {
			const action: RecentFilesAction = {
				type: RecentFilesActions.SET_RECENT_FILES,
				payload: ["sample1.cc.json", "sample2.cc.json"]
			}
			storeService["store"].dispatch(action)

			recentFilesService.onStoreChanged(RecentFilesActions.SET_RECENT_FILES)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("recent-files-changed", {
				recentFiles: ["sample1.cc.json", "sample2.cc.json"]
			})
		})

		it("should not notify anything on non-recent-files-events", () => {
			recentFilesService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
