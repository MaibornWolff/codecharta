import "./layoutSelection.module"
import { LayoutSelectionController } from "./layoutSelection.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { LayoutAlgorithmService } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import _ from "lodash"
import { LayoutAlgorithm } from "../../codeCharta.model"

describe("LayoutSelectionController", () => {
	let layoutSelectionController: LayoutSelectionController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.layoutSelection")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("$rootScope")
	}

	function rebuildController() {
		layoutSelectionController = new LayoutSelectionController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to LayoutAlgorithmService Events", () => {
			LayoutAlgorithmService.subscribe = jest.fn()

			rebuildController()

			expect(LayoutAlgorithmService.subscribe).toHaveBeenCalledWith($rootScope, layoutSelectionController)
		})

		it("should initialise viewModel LayoutAlgorithms", () => {
			rebuildController()

			expect(layoutSelectionController["_viewModel"].layoutAlgorithms).toEqual(_.values(LayoutAlgorithm))
		})
	})

	describe("onLayoutAlgorithmChanged", () => {
		it("should update viewModel", () => {
			layoutSelectionController["_viewModel"].layoutAlgorithm = null

			layoutSelectionController.onLayoutAlgorithmChanged(LayoutAlgorithm.StreetMap)

			expect(layoutSelectionController["_viewModel"].layoutAlgorithm).toEqual(LayoutAlgorithm.StreetMap)
		})
	})

	describe("applyLayoutAlgorithm", () => {
		it("should set new layoutAlgorithm into redux store", () => {
			layoutSelectionController["_viewModel"].layoutAlgorithm = LayoutAlgorithm.StreetMap

			layoutSelectionController.applyLayoutAlgorithm()

			expect(storeService.getState().appSettings.layoutAlgorithm).toEqual(LayoutAlgorithm.StreetMap)
		})
	})
})
