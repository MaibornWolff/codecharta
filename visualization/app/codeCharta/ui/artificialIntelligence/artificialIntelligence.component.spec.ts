import "./artificialIntelligence.module"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ArtificialIntelligenceController } from "./artificialIntelligence.component"
import { FilesService } from "../../state/store/files/files.service"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES, FILE_STATES_JAVA, FILE_STATES_UNSELECTED } from "../../util/dataMocks"
import { klona } from "klona"
import { BlacklistType } from "../../codeCharta.model"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { ExperimentalFeaturesEnabledService } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { SuspiciousMetricConfig } from "./suspiciousMetricConfig.api.model"
import { SuspiciousMetricConfigHelper } from "./suspiciousMetricConfigHelper"
import { setState } from "../../state/store/state.actions"

describe("ArtificialIntelligenceController", () => {
	let artificialIntelligenceController: ArtificialIntelligenceController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let threeCameraService: ThreeCameraService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.artificialIntelligence")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("storeService")
		threeCameraService = getService<ThreeCameraService>("storeService")

		storeService.dispatch(setFiles(FILE_STATES))
	}

	function rebuildController() {
		artificialIntelligenceController = new ArtificialIntelligenceController(
			$rootScope,
			storeService,
			threeOrbitControlsService,
			threeCameraService
		)

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
			artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"] = jest.fn()
			artificialIntelligenceController["fileState"] = FILE_STATES_JAVA[0]

			storeService.dispatch(setExperimentalFeaturesEnabled(false))
			artificialIntelligenceController.onExperimentalFeaturesEnabledChanged(false)

			expect(artificialIntelligenceController["getMostFrequentLanguage"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["clearRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"]).not.toHaveBeenCalled()
		})

		it("should calculate suspicious metrics when experimental features are enabled", function () {
			artificialIntelligenceController["getMostFrequentLanguage"] = jest.fn().mockReturnValue("java")
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"] = jest.fn()
			artificialIntelligenceController["fileState"] = FILE_STATES_JAVA[0]

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onExperimentalFeaturesEnabledChanged(true)

			expect(artificialIntelligenceController["getMostFrequentLanguage"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"]).toHaveBeenCalled()
		})
	})

	describe("apply suspicious metric Config", () => {
		it("should call store.dispatch", () => {
			const suspiciousMetricConfigStub = {
				stateSettings: {
					dynamicSettings: {
						margin: 1,
						colorRange: { from: 1, to: 2 }
					}
				}
			} as SuspiciousMetricConfig

			SuspiciousMetricConfigHelper.getSuspiciousMetricConfigSettings = jest.fn().mockReturnValue(suspiciousMetricConfigStub)
			storeService.dispatch = jest.fn()
			threeOrbitControlsService.setControlTarget = jest.fn()

			artificialIntelligenceController.applySuspiciousMetricConfig("suspiciousMetricConfig1")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState(suspiciousMetricConfigStub.stateSettings))
		})
	})

	describe("on files selection changed", () => {
		it("should do nothing if no file is selected", () => {
			artificialIntelligenceController["getMostFrequentLanguage"] = jest.fn()
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_UNSELECTED)
			expect(artificialIntelligenceController["getMostFrequentLanguage"]).not.toHaveBeenCalled()
		})

		it("should not calculate risk profile and suggest suspiciousMetric configs on empty main programming language", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"] = jest.fn()
			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES)

			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"]).not.toHaveBeenCalled()
		})

		it("should clear and calculate risk profile for Java map", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"] = jest.fn()

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toMatchSnapshot()
			expect(artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"]).toHaveBeenCalled()
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

		it("should create suspiciousMetric config suggestions sorted by outlierSuspiciousMetricConfigId", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()

			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["_viewModel"].analyzedProgrammingLanguage).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()

			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[0].generalSuspiciousMetricConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[0].outlierSuspiciousMetricConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[1].generalSuspiciousMetricConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[1].outlierSuspiciousMetricConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[2].generalSuspiciousMetricConfigId = "mocked"

			expect(artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks).toMatchSnapshot()
			expect(artificialIntelligenceController["_viewModel"].unsuspiciousMetrics).toMatchSnapshot()
		})

		it("should calculate risk profile for not excluded files only", () => {
			artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"] = jest.fn()

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
			expect(artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"]).toHaveBeenCalled()
		})

		it("should calculate risk profile but skip files with missing metrics", () => {
			artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"] = jest.fn()

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
			expect(artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"]).toHaveBeenCalled()
		})

		it("should calculate risk profile and add suspiciousMetric configs for maps with other programming languages", () => {
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"] = jest.fn()

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
			expect(artificialIntelligenceController["createSuspiciousMetricConfigSuggestions"]).toHaveBeenCalled()
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
