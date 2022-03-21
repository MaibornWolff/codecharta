import "./artificialIntelligence.module"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ArtificialIntelligenceController } from "./artificialIntelligence.component"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES_JAVA, STATE } from "../../util/dataMocks"
import { ColorRange } from "../../codeCharta.model"
import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"

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
		it("should call store dispatch with all needed states for desired suspicious metric view", () => {
			const testMetricSuggestionParameters = {
				metric: "loc",
				from: 365,
				to: 554,
				max: 0,
				min: 0,
				isOutlier: undefined
			}

			const colorRange: ColorRange = {
				from: testMetricSuggestionParameters.from,
				to: testMetricSuggestionParameters.to,
				max: 0,
				min: 0
			}

			artificialIntelligenceController.viewModel.suspiciousMetricSuggestionLinks = [testMetricSuggestionParameters]

			const dispatchSpy = jest.spyOn(storeService, "dispatch")
			artificialIntelligenceController.applySuspiciousMetric(testMetricSuggestionParameters, false)

			expect(dispatchSpy).toHaveBeenCalledWith(setAreaMetric("rloc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setHeightMetric("loc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setColorMetric("loc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setColorRange(colorRange))
			expect(dispatchSpy).toHaveBeenCalledWith(setMapColors(STATE.appSettings.mapColors))
		})

		it("should call store.dispatch with all needed states for desired very high risk metric view", () => {
			const mapColors = { ...STATE.appSettings.mapColors }
			mapColors.positive = "#ffffff"
			mapColors.neutral = "#ffffff"
			mapColors.negative = "#A900C0"

			const testMetricSuggestionParameters = {
				metric: "loc",
				from: 365,
				to: 554,
				max: 0,
				min: 0,
				isOutlier: true
			}

			const colorRange: ColorRange = {
				from: testMetricSuggestionParameters.from,
				to: testMetricSuggestionParameters.to,
				max: 0,
				min: 0
			}

			artificialIntelligenceController.viewModel.suspiciousMetricSuggestionLinks = [testMetricSuggestionParameters]
			const dispatchSpy = jest.spyOn(storeService, "dispatch")
			artificialIntelligenceController.applySuspiciousMetric(testMetricSuggestionParameters, true)

			expect(dispatchSpy).toHaveBeenCalledWith(setAreaMetric("rloc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setHeightMetric("loc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setColorMetric("loc"))
			expect(dispatchSpy).toHaveBeenCalledWith(setColorRange(colorRange))
			expect(dispatchSpy).toHaveBeenCalledWith(setMapColors(mapColors))
		})

		it("should calculate suspicious metrics sorted by isOutlier", () => {
			expect(artificialIntelligenceController.viewModel.analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController.viewModel.suspiciousMetricSuggestionLinks).toMatchSnapshot()
			expect(artificialIntelligenceController.viewModel.unsuspiciousMetrics).toMatchSnapshot()
		})
	})
})
