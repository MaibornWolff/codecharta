import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { AmountOfTopLabelsAction, AmountOfTopLabelsActions } from "./amountOfTopLabels.actions"
import { AmountOfTopLabelsService } from "./amountOfTopLabels.service"

describe("AmountOfTopLabelsService", () => {
	let amountOfTopLabelsService: AmountOfTopLabelsService
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
		amountOfTopLabelsService = new AmountOfTopLabelsService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, amountOfTopLabelsService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new amountOfTopLabels value", () => {
			const action: AmountOfTopLabelsAction = {
				type: AmountOfTopLabelsActions.SET_AMOUNT_OF_TOP_LABELS,
				payload: 2
			}
			storeService["store"].dispatch(action)

			amountOfTopLabelsService.onStoreChanged(AmountOfTopLabelsActions.SET_AMOUNT_OF_TOP_LABELS)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("amount-of-top-labels-changed", { amountOfTopLabels: 2 })
		})

		it("should not notify anything on non-amount-of-top-labels-events", () => {
			amountOfTopLabelsService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
