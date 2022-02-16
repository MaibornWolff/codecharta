import "./artificialIntelligence.module"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ArtificialIntelligenceController } from "./artificialIntelligence.component"
import { FilesService } from "../../state/store/files/files.service"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES, FILE_STATES_JAVA, FILE_STATES_UNSELECTED, STATE } from "../../util/dataMocks"
import { klona } from "klona"
import { BlacklistType, ColorRange } from "../../codeCharta.model"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { ExperimentalFeaturesEnabledService } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { setState } from "../../state/store/state.actions"

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

		storeService.dispatch(setFiles(FILE_STATES))
	}

	function rebuildController() {
		artificialIntelligenceController = new ArtificialIntelligenceController($rootScope, storeService)

		// Overwrite debounce with original function, otherwise calculate() will not be called
		artificialIntelligenceController["debounceCalculation"] = artificialIntelligenceController["calculate"]
	}

	describe("constructor", () => {
		it("should subscribe to file service", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, artificialIntelligenceController)
		})

		it("should subscribe to blacklist service", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildController()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, artificialIntelligenceController)
		})

		it("should subscribe to experimentalFeaturesEnabled service", () => {
			ExperimentalFeaturesEnabledService.subscribe = jest.fn()

			rebuildController()

			expect(ExperimentalFeaturesEnabledService.subscribe).toHaveBeenCalledWith($rootScope, artificialIntelligenceController)
		})
	})

	describe("calculations", () => {
		it("should not calculate suspicious metrics when experimental features are disabled", function () {
			artificialIntelligenceController["getMostFrequentLanguage"] = jest.fn()
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateSuspiciousMetrics"] = jest.fn()
			artificialIntelligenceController["fileState"] = FILE_STATES_JAVA[0]

			storeService.dispatch(setExperimentalFeaturesEnabled(false))
			artificialIntelligenceController.onExperimentalFeaturesEnabledChanged(false)

			expect(artificialIntelligenceController["getMostFrequentLanguage"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["clearRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateSuspiciousMetrics"]).not.toHaveBeenCalled()
		})

		it("should calculate suspicious metrics when experimental features are enabled", function () {
			artificialIntelligenceController["getMostFrequentLanguage"] = jest.fn().mockReturnValue("java")
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateSuspiciousMetrics"] = jest.fn()
			artificialIntelligenceController["fileState"] = FILE_STATES_JAVA[0]

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onExperimentalFeaturesEnabledChanged(true)

			expect(artificialIntelligenceController["getMostFrequentLanguage"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateSuspiciousMetrics"]).toHaveBeenCalled()
		})
	})

	describe("apply suspicious metric", () => {
		it("should call store.dispatch with all needed states for desired suspicious metric view", () => {
			storeService.dispatch(setState(STATE))
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

			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks = [testMetricSuggestionParameters]
			storeService.dispatch = jest.fn()
			artificialIntelligenceController.applySuspiciousMetric(testMetricSuggestionParameters, false)

			expect(storeService.dispatch).toHaveBeenCalledWith(setAreaMetric("rloc"))
			expect(storeService.dispatch).toHaveBeenCalledWith(setHeightMetric("loc"))
			expect(storeService.dispatch).toHaveBeenCalledWith(setColorMetric("loc"))
			expect(storeService.dispatch).toHaveBeenCalledWith(setColorRange(colorRange))
			expect(storeService.dispatch).toHaveBeenCalledWith(setMapColors(STATE.appSettings.mapColors))
		})

		it("should call store.dispatch with all needed states for desired very high risk metric view", () => {
			storeService.dispatch(setState(STATE))
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

			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks = [testMetricSuggestionParameters]
			storeService.dispatch = jest.fn()
			artificialIntelligenceController.applySuspiciousMetric(testMetricSuggestionParameters, true)

			expect(storeService.dispatch).toHaveBeenCalledWith(setAreaMetric("rloc"))
			expect(storeService.dispatch).toHaveBeenCalledWith(setHeightMetric("loc"))
			expect(storeService.dispatch).toHaveBeenCalledWith(setColorMetric("loc"))
			expect(storeService.dispatch).toHaveBeenCalledWith(setColorRange(colorRange))
			expect(storeService.dispatch).toHaveBeenCalledWith(setMapColors(mapColors))
		})
	})

	describe("on files selection changed", () => {
		it("should do nothing if no file is selected", () => {
			artificialIntelligenceController["getMostFrequentLanguage"] = jest.fn()
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_UNSELECTED)
			expect(artificialIntelligenceController["getMostFrequentLanguage"]).not.toHaveBeenCalled()
		})

		it("should not calculate risk profile and suspicious metrics on empty main programming language", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()
			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES)

			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).not.toHaveBeenCalled()
		})

		it("should clear and calculate risk profile for Java map", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateSuspiciousMetrics"] = jest.fn()

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toMatchSnapshot()
			expect(artificialIntelligenceController["calculateSuspiciousMetrics"]).toHaveBeenCalled()
		})

		it("should calculate risk profile and should not exceed 100 percent", () => {
			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			const sumOfRiskPercentage = Object.values(artificialIntelligenceController["_viewModel"].riskProfile).reduce((a, b) => a + b)
			const expectedRiskProfile = {
				highRisk: 37,
				lowRisk: 46,
				moderateRisk: 17,
				veryHighRisk: 0
			}

			expect(artificialIntelligenceController["_viewModel"].riskProfile).toEqual(expectedRiskProfile)
			expect(sumOfRiskPercentage).toEqual(100)
		})

		it("should calculate suspicious metrics sorted by isOutlier", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()

			expect(artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks).toMatchSnapshot()
			expect(artificialIntelligenceController["_viewModel"].unsuspiciousMetrics).toMatchSnapshot()
		})

		it("should calculate risk profile for not excluded files only", () => {
			artificialIntelligenceController["calculateSuspiciousMetrics"] = jest.fn()

			const codeMapNodeToExclude = FILE_STATES_JAVA[0].file.map.children[0].children[0]

			artificialIntelligenceController["blacklist"] = [
				{
					path: codeMapNodeToExclude.path,
					type: BlacklistType.exclude
				}
			]

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toMatchSnapshot()
			expect(artificialIntelligenceController["calculateSuspiciousMetrics"]).toHaveBeenCalled()
		})

		it("should calculate risk profile but skip files with missing metrics", () => {
			artificialIntelligenceController["calculateSuspiciousMetrics"] = jest.fn()

			const FILE_STATES_MISSING_METRICS = klona(FILE_STATES_JAVA)
			for (const codeMapNode of FILE_STATES_MISSING_METRICS[0].file.map.children) {
				codeMapNode.children.map(childCodeMapNode => {
					childCodeMapNode.attributes = {}
				})
			}

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_MISSING_METRICS)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toBeUndefined()
			expect(artificialIntelligenceController["calculateSuspiciousMetrics"]).toHaveBeenCalled()
		})

		it("should calculate risk profile and suspicious metrics for maps with other programming languages", () => {
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateSuspiciousMetrics"] = jest.fn()

			const FILE_STATES_OTHER = klona(FILE_STATES_JAVA)
			for (const codeMapNode of FILE_STATES_OTHER[0].file.map.children) {
				codeMapNode.children.map(childCodeMapNode => {
					childCodeMapNode.name = childCodeMapNode.name.replace(/\.java/, ".other")
				})
			}

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_OTHER)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("other")
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateSuspiciousMetrics"]).toHaveBeenCalled()
		})
	})

	describe("on blacklist changed", () => {
		it("should do nothing on blacklist change if no file is selected", () => {
			storeService.dispatch(setFiles(FILE_STATES_UNSELECTED))
			artificialIntelligenceController["debounceCalculation"] = jest.fn()

			artificialIntelligenceController.onBlacklistChanged([])
			expect(artificialIntelligenceController["debounceCalculation"]).not.toHaveBeenCalled()
		})

		it("should calculate risk profile on blacklist changed", () => {
			storeService.dispatch(setFiles(FILE_STATES_JAVA))
			artificialIntelligenceController["debounceCalculation"] = jest.fn()

			artificialIntelligenceController.onBlacklistChanged([])
			expect(artificialIntelligenceController["debounceCalculation"]).toHaveBeenCalled()
		})
	})
})
