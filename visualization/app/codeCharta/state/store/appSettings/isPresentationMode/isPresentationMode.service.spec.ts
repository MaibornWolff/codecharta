import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { PresentationModeAction, PresentationModeActions } from "../../appSettings/isPresentationMode/isPresentationMode.actions"
import { IsPresentationModeService } from "./isPresentationMode.service"
import { BlacklistActions } from "../../fileSettings/blacklist/blacklist.actions"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("IsPresentationModeService", () => {
	let isPresentationModeService: IsPresentationModeService
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
		isPresentationModeService = new IsPresentationModeService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribeToFilesSelection to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, isPresentationModeService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new mode", () => {
			const action: PresentationModeAction = {
				type: PresentationModeActions.SET_PRESENTATION_MODE,
				payload: true
			}
			storeService["store"].dispatch(action)

			isPresentationModeService.onStoreChanged(PresentationModeActions.SET_PRESENTATION_MODE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("presentation-mode-changed", { isPresentationMode: true })
		})

		it("should not notify anything on non-presentation-mode-events", () => {
			isPresentationModeService.onStoreChanged(BlacklistActions.ADD_BLACKLIST_ITEM)

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
