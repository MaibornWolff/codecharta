import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { AmountOfEdgePreviewsAction, AmountOfEdgePreviewsActions } from "./amountOfEdgePreviews.actions"
import { AmountOfEdgePreviewsService } from "./amountOfEdgePreviews.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("AmountOfEdgePreviewsService", () => {
	let amountOfEdgePreviewsService: AmountOfEdgePreviewsService
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
		amountOfEdgePreviewsService = new AmountOfEdgePreviewsService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, amountOfEdgePreviewsService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new amountOfEdgePreviews value", () => {
			const action: AmountOfEdgePreviewsAction = {
				type: AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS,
				payload: 2
			}
			storeService["store"].dispatch(action)

			amountOfEdgePreviewsService.onStoreChanged(AmountOfEdgePreviewsActions.SET_AMOUNT_OF_EDGE_PREVIEWS)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("amount-of-edge-previews-changed", {
				amountOfEdgePreviews: 2
			})
		})

		it("should not notify anything on non-amount-of-edge-previews-events", () => {
			amountOfEdgePreviewsService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
