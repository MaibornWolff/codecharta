import "./artificialIntelligence.module"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ArtificialIntelligenceController } from "./artificialIntelligence.component"
import { FilesService } from "../../state/store/files/files.service"
import { CustomConfig } from "../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES, FILE_STATES_JAVA, FILE_STATES_UNSELECTED } from "../../util/dataMocks"
import { setState } from "../../state/store/state.actions"
import { klona } from "klona"

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
	}

	describe("constructor", () => {
		it("should subscribe to file service", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, artificialIntelligenceController)
		})
	})

	describe("apply custom Config", () => {
		it("should call store.dispatch", () => {
			const customConfigStub = {
				stateSettings: {
					dynamicSettings: {
						margin: 1,
						colorRange: { from: 1, to: 2 }
					}
				}
			} as CustomConfig

			CustomConfigHelper.getCustomConfigSettings = jest.fn().mockReturnValue(customConfigStub)
			storeService.dispatch = jest.fn()
			threeOrbitControlsService.setControlTarget = jest.fn()

			artificialIntelligenceController.applyCustomConfig("CustomConfig1")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState(customConfigStub.stateSettings))
		})
	})

	describe("on files selection changed", () => {
		it("should do nothing if no file is selected", () => {
			artificialIntelligenceController["getMostFrequentLanguage"] = jest.fn()
			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_UNSELECTED)
			expect(artificialIntelligenceController["getMostFrequentLanguage"]).not.toHaveBeenCalled()
		})

		it("should not calculate risk profile and suggest custom configs on empty main programming language", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()

			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES)

			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).not.toHaveBeenCalled()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).not.toHaveBeenCalled()
		})

		it("should clear and calculate risk profile for Java map", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()

			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["mainProgrammingLanguage"]).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toMatchSnapshot()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})

		it("should create custom config suggestions", () => {
			artificialIntelligenceController["clearRiskProfile"] = jest.fn()
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()

			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_JAVA)

			expect(artificialIntelligenceController["mainProgrammingLanguage"]).toBe("java")
			expect(artificialIntelligenceController["clearRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()

			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[0].generalCustomConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[1].generalCustomConfigId = "mocked"
			artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks[1].outlierCustomConfigId = "mocked"

			expect(artificialIntelligenceController["_viewModel"].suspiciousMetricSuggestionLinks).toMatchSnapshot()
			expect(artificialIntelligenceController["_viewModel"].unsuspiciousMetrics).toMatchSnapshot()
		})

		it("should calculate risk profile for not excluded files only", () => {
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()

			const FILE_STATE_WITH_EXCLUDED_FILES = klona(FILE_STATES_JAVA)
			FILE_STATE_WITH_EXCLUDED_FILES[0].file.map.children[0].children[0].isExcluded = true

			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATE_WITH_EXCLUDED_FILES)

			expect(artificialIntelligenceController["mainProgrammingLanguage"]).toBe("java")
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toMatchSnapshot()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})

		it("should calculate risk profile but skip files with missing metrics", () => {
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()

			const FILE_STATES_MISSING_METRICS = klona(FILE_STATES_JAVA)
			for (const codeMapNode of FILE_STATES_MISSING_METRICS[0].file.map.children) {
				codeMapNode.children.map(childCodeMapNode => {
					childCodeMapNode.attributes = {}
				})
			}

			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_MISSING_METRICS)

			expect(artificialIntelligenceController["mainProgrammingLanguage"]).toBe("java")
			expect(artificialIntelligenceController["_viewModel"].riskProfile).toBeUndefined()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})

		it("should calculate risk profile and add custom configs for maps with other programming languages", () => {
			artificialIntelligenceController["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceController["createCustomConfigSuggestions"] = jest.fn()

			const FILE_STATES_OTHER = klona(FILE_STATES_JAVA)
			for (const codeMapNode of FILE_STATES_OTHER[0].file.map.children) {
				codeMapNode.children.map(childCodeMapNode => {
					childCodeMapNode.name = childCodeMapNode.name.replace(/\.java/, ".other")
				})
			}

			artificialIntelligenceController.onFilesSelectionChanged(FILE_STATES_OTHER)

			expect(artificialIntelligenceController["mainProgrammingLanguage"]).toBe("other")
			expect(artificialIntelligenceController["calculateRiskProfile"]).toHaveBeenCalled()
			expect(artificialIntelligenceController["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})
	})
})
