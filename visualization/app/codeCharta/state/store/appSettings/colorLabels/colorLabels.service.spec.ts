import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ColorLabelsAction, ColorLabelsActions, defaultColorLabels } from "./colorLabels.actions"
import { ColorLabelsService } from "./colorLabels.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("ColorLabelsService", () => {
	let colorLabelsService: ColorLabelsService
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
		colorLabelsService = new ColorLabelsService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, colorLabelsService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new colorLabels value", () => {
			const action: ColorLabelsAction = {
				type: ColorLabelsActions.SET_COLOR_LABELS,
				payload: defaultColorLabels
			}
			storeService["store"].dispatch(action)

			colorLabelsService.onStoreChanged(ColorLabelsActions.SET_COLOR_LABELS)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("color-labels-changed", { colorLabels: defaultColorLabels })
		})

		it("should not notify anything on non-color-labels-events", () => {
			colorLabelsService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
