import "./artificialIntelligence.module"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ArtificialIntelligenceController } from "./artificialIntelligence.component"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES_JAVA } from "../../util/dataMocks"
import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"

jest.mock("lodash.debounce", () => (function_: () => void) => function_)

describe("ArtificialIntelligenceController", () => {
	let artificialIntelligenceController: ArtificialIntelligenceController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.artificialIntelligence")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")

		storeService.dispatch(setExperimentalFeaturesEnabled(true))
	}

	function rebuildController() {
		artificialIntelligenceController = new ArtificialIntelligenceController($rootScope, storeService)
		storeService.dispatch(setFiles(FILE_STATES_JAVA))
	}

	describe("apply suspicious metric", () => {
		it("should set view model to undefined when experimental features are disabled", () => {
			storeService.dispatch(setExperimentalFeaturesEnabled(false))

			expect(artificialIntelligenceController.viewModel).toBeUndefined()
		})

		it("should apply suspicious metric view", () => {
			const testMetricSuggestionParameters = {
				metric: "mcc",
				from: 365,
				to: 554,
				max: 0,
				min: 0
			}
			const dispatchSpy = jest.spyOn(storeService, "dispatch")

			artificialIntelligenceController.applySuspiciousMetric(testMetricSuggestionParameters, false)

			expect(dispatchSpy).toHaveBeenCalledWith(setAreaMetric("rloc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setHeightMetric("mcc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setColorMetric("mcc"))
			expect(dispatchSpy).toHaveBeenCalledWith(
				setColorRange({
					from: testMetricSuggestionParameters.from,
					to: testMetricSuggestionParameters.to,
					max: 0,
					min: 0
				})
			)
			expect(dispatchSpy).toHaveBeenCalledWith(
				setMapColors({
					positive: defaultMapColors.positive,
					neutral: defaultMapColors.neutral,
					negative: defaultMapColors.negative
				})
			)
		})

		it("should apply view for very high risk metric", () => {
			const testMetricSuggestionParameters = {
				metric: "mcc",
				from: 365,
				to: 554,
				max: 0,
				min: 0,
				isOutlier: true
			}
			const dispatchSpy = jest.spyOn(storeService, "dispatch")

			artificialIntelligenceController.applySuspiciousMetric(testMetricSuggestionParameters, true)

			expect(dispatchSpy).toHaveBeenCalledWith(setAreaMetric("rloc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setHeightMetric("mcc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setColorMetric("mcc"))
			expect(dispatchSpy).toHaveBeenCalledWith(
				setColorRange({
					from: testMetricSuggestionParameters.from,
					to: testMetricSuggestionParameters.to,
					max: 0,
					min: 0
				})
			)
			expect(dispatchSpy).toHaveBeenCalledWith(
				setMapColors({
					positive: "#ffffff",
					neutral: "#ffffff",
					negative: "#A900C0"
				})
			)
		})
	})
})
