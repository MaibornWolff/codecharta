import "./legendPanel.module"

import { LegendPanelController, PackageList } from "./legendPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"
import { CCFile, Settings } from "../../codeCharta.model"
import { SETTINGS, TEST_FILE_DATA } from "../../util/dataMocks"

describe("LegendPanelController", () => {
	let legendPanelController: LegendPanelController
	let $rootScope: IRootScopeService
	let fileStateService: FileStateService
	let settings: Settings
	let file: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.legendPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		fileStateService = getService<FileStateService>("fileStateService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
		file = JSON.parse(JSON.stringify(TEST_FILE_DATA))
	}

	function rebuildController() {
		legendPanelController = new LegendPanelController($rootScope, fileStateService)
	}

	describe("MarkingColor in Legend", () => {
		beforeEach(() => {
			fileStateService["fileStates"].push({ file, selectedAs: null })
		})

		it("set correct markingPackage in Legend", () => {
			settings.fileSettings.markedPackages = [{ color: "#FF0000", path: "/root", attributes: {} }]
			const expectedPackageLists: PackageList[] = [
				{
					colorPixel: "data:image/gif;base64,R0lGODlhAQABAPAAAP8AAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
					markedPackages: [{ color: "#FF0000", path: "/root", attributes: { name: "/root" } }]
				}
			]

			legendPanelController.onSettingsChanged(settings, undefined)

			expect(legendPanelController["_viewModel"].packageLists).toEqual(expectedPackageLists)
		})

		it("shorten too long pathName in middle of the string for legendPanel", () => {
			settings.fileSettings.markedPackages = [{ color: "#FF0000", path: "/root/a/longNameToBeShortenedInLegend", attributes: {} }]
			const shortenedPathname = "longNameToBe...enedInLegend"

			legendPanelController.onSettingsChanged(settings, undefined)
			expect(legendPanelController["_viewModel"].packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname)
		})

		it("shorten too long pathName at beginning of the string for legendPanel", () => {
			settings.fileSettings.markedPackages = [{ color: "#FF0000", path: "/root/a/andAnotherLongNameToShorten", attributes: {} }]
			const shortenedPathname = ".../andAnotherLongNameToShorten"

			legendPanelController.onSettingsChanged(settings, undefined)
			expect(legendPanelController["_viewModel"].packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname)
		})
	})
})
