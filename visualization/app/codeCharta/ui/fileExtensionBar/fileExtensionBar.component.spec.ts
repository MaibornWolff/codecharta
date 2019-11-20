import "./fileExtensionBar.module"
import _ from "lodash"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { METRIC_DISTRIBUTION, NONE_METRIC_DISTRIBUTION, SETTINGS, TEST_FILE_WITH_PATHS } from "../../util/dataMocks"
import { FileExtensionCalculator, MetricDistribution } from "../../util/fileExtensionCalculator"
import { FileExtensionBarController } from "./fileExtensionBar.component"
import { BlacklistType, Settings } from "../../codeCharta.model"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"

describe("FileExtensionBarController", () => {
	let fileExtensionBarController: FileExtensionBarController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let threeSceneService: ThreeSceneService

	let distribution: MetricDistribution[] = METRIC_DISTRIBUTION
	let settings: Settings

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.fileExtensionBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")

		settings = _.cloneDeep(SETTINGS)
	}

	function rebuildController() {
		fileExtensionBarController = new FileExtensionBarController($rootScope, settingsService, threeSceneService)
	}

	function withMockedSettingsService() {
		settingsService = fileExtensionBarController["settingsService"] = jest.fn().mockReturnValue({
			getSettings: jest.fn().mockReturnValue(settings)
		})()
	}

	describe("onRenderMapChanged", () => {
		beforeEach(() => {
			FileExtensionCalculator.getMetricDistribution = jest.fn().mockReturnValue(distribution)
		})
		it("should set viewModel.distribution for given metric", () => {
			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(fileExtensionBarController["_viewModel"].distribution).toEqual(distribution)
		})

		it("should call getMetricDistribution with mcc", () => {
			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(FileExtensionCalculator.getMetricDistribution).toHaveBeenCalledWith(TEST_FILE_WITH_PATHS.map, "mcc", [])
		})

		it("should call getMetricDistribution with a blacklist", () => {
			const blacklistEntry = { path: "a/path", type: BlacklistType.exclude }
			settings.fileSettings.blacklist.push(blacklistEntry)

			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(FileExtensionCalculator.getMetricDistribution).toHaveBeenCalledWith(
				TEST_FILE_WITH_PATHS.map,
				"mcc",
				settings.fileSettings.blacklist
			)
		})

		it("should set the color of given extension attribute", () => {
			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(distribution[0].color).toEqual("hsl(58, 40%, 50%)")
		})

		it("should remain the color property of the extension, if it already has one", () => {
			distribution[0].color = "#4286f4"

			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(distribution[0].color).toEqual("#4286f4")
		})

		it("should set viewModel.distribution with just the none Object, if no extension was found for the metric", () => {
			FileExtensionCalculator.getMetricDistribution = jest.fn().mockReturnValue([])

			fileExtensionBarController.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

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
