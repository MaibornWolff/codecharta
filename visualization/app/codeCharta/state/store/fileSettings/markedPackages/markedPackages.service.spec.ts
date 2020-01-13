import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { MarkedPackagesAction, MarkedPackagesActions } from "./markedPackages.actions"
import { MarkedPackagesService } from "./markedPackages.service"
import { MARKED_PACKAGES, withMockedEventMethods } from "../../../../util/dataMocks"

describe("MarkedPackagesService", () => {
	let markedPackagesService: MarkedPackagesService
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
		markedPackagesService = new MarkedPackagesService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, markedPackagesService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new markedPackages value", () => {
			const action: MarkedPackagesAction = {
				type: MarkedPackagesActions.SET_MARKED_PACKAGES,
				payload: MARKED_PACKAGES
			}
			storeService["store"].dispatch(action)

			markedPackagesService.onStoreChanged(MarkedPackagesActions.SET_MARKED_PACKAGES)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("marked-packages-changed", { markedPackages: MARKED_PACKAGES })
		})

		it("should not notify anything on non-marked-packages-events", () => {
			markedPackagesService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
