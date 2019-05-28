import "./fileExtensionBar.module"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"
import { CodeMapRenderService } from "../codeMap/codeMap.render.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { TEST_FILE_WITH_PATHS, SETTINGS, METRIC_DISTRIBUTION, NONE_METRIC_DISTRIBUTION } from "../../util/dataMocks"
import { MetricDistribution, FileExtensionCalculator } from "../../util/fileExtensionCalculator"
import { FileExtensionBarController } from "./fileExtensionBar.component"

describe("FileExtensionBarController", () => {
	let fileExtensionBarController: FileExtensionBarController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let codeMapRenderService: CodeMapRenderService
	let threeSceneService: ThreeSceneService

	let distribution: MetricDistribution[] = METRIC_DISTRIBUTION

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.fileExtensionBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		codeMapRenderService = getService<CodeMapRenderService>("codeMapRenderService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
	}

	function rebuildController() {
		fileExtensionBarController = new FileExtensionBarController($rootScope, settingsService, codeMapRenderService, threeSceneService)
	}

	function withMockedSettingsService() {
		settingsService = fileExtensionBarController["settingsService"] = jest.fn().mockReturnValue({
			getSettings: jest.fn().mockReturnValue(SETTINGS)
		})()
	}

	describe("onRenderFileChanged", () => {
		beforeEach(() => {
			FileExtensionCalculator.getMetricDistribution = jest.fn().mockReturnValue(distribution)
		})
		it("should set viewModel.distribution for given metric", () => {
			fileExtensionBarController.onRenderFileChanged(TEST_FILE_WITH_PATHS, undefined)

			expect(fileExtensionBarController["_viewModel"].distribution).toEqual(distribution)
		})

		it("should call getMetricDistribution with mcc", () => {
			fileExtensionBarController.onRenderFileChanged(TEST_FILE_WITH_PATHS, undefined)

			expect(FileExtensionCalculator.getMetricDistribution).toHaveBeenCalledWith(TEST_FILE_WITH_PATHS.map, "mcc")
		})

		it("should set the color of given extension attribute", () => {
			fileExtensionBarController.onRenderFileChanged(TEST_FILE_WITH_PATHS, undefined)

			expect(distribution[0].color).toEqual("hsla(58, 40%, 50%)")
		})

		it("should remain the color property of the extension, if it already has one", () => {
			distribution[0].color = "#4286f4"

			fileExtensionBarController.onRenderFileChanged(TEST_FILE_WITH_PATHS, undefined)

			expect(distribution[0].color).toEqual("#4286f4")
		})

		it("should set viewModel.distribution with just the none Object, if no extension was found for the metric", () => {
			FileExtensionCalculator.getMetricDistribution = jest.fn().mockReturnValue([])

			fileExtensionBarController.onRenderFileChanged(TEST_FILE_WITH_PATHS, undefined)

			expect(fileExtensionBarController["_viewModel"].distribution).toEqual(NONE_METRIC_DISTRIBUTION)
		})
	})

	describe("toggleExtensiveMode", () => {
		it("should set viewModel.isExtensiveMode to false", () => {
			fileExtensionBarController["_viewModel"].isExtensiveMode = true

			fileExtensionBarController.toggleExtensiveMode()

			expect(fileExtensionBarController["_viewModel"].isExtensiveMode).toBeFalsy()
		})

		it("should set viewModel.isExtensiveMode to true", () => {
			fileExtensionBarController["_viewModel"].isExtensiveMode = false

			fileExtensionBarController.toggleExtensiveMode()

			expect(fileExtensionBarController["_viewModel"].isExtensiveMode).toBeTruthy
		})
	})
})
