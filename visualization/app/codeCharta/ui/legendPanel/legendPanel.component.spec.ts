import "./legendPanel.module"

import { LegendPanelController, PackageList } from "./legendPanel.component"
import { SettingsService } from "../../state/settings.service"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeChartaService } from "../../codeCharta.service"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"

describe("LegendPanelController", () => {
	let services, legendPanelController: LegendPanelController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.legendPanel")

		services = {
			$rootScope: getService<IRootScopeService>("$rootScope"),
			settingsService: getService<SettingsService>("settingsService"),
			codeChartaService: getService<CodeChartaService>("codeChartaService"),
			fileStateService: getService<FileStateService>("fileStateService"),
		}
	}

	function rebuildController() {
		legendPanelController = new LegendPanelController(
			services.$rootScope,
			services.settingsService,
			services.codeChartaService,
			services.fileStateService
		)
	}

	describe("MarkingColor in Legend", () => {
		beforeEach(() => {
			let simpleHierarchy = {
				name: "root",
				type: "Folder",
				path: "/root",
				attributes: {},
				children: [
					{
						name: "a",
						type: "Folder",
						path: "/root/a",
						attributes: {},
						children: [
							{
								name: "aa",
								type: "File",
								path: "/root/a/aa",
								attributes: {}
							},
							{
								name: "ab",
								type: "Folder",
								path: "/root/a/ab",
								attributes: {},
								children: [
									{
										name: "aba",
										path: "/root/a/ab/aba",
										type: "File",
										attributes: {}
									}
								]
							}
						]
					},
					{
						name: "b",
						type: "File",
						path: "/root/b",
						attributes: {}
					}
				]
			}

			services.fileStateService.fileStates.push({ file: simpleHierarchy, selectedAs: null })
		})

		it("set correct markingPackage in Legend", () => {
			services.settingsService.settings.fileSettings.markedPackages = [{ color: "#FF0000", path: "/root", attributes: {} }]
			const expectedPackageLists: PackageList[] = [
				{
					colorPixel: "data:image/gif;base64,R0lGODlhAQABAPAAAP8AAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
					markedPackages: [{ color: "#FF0000", path: "/root", attributes: { name: "/root" } }]
				}
			]

			legendPanelController.onSettingsChanged(services.settingsService.settings, null)

			expect(legendPanelController["_viewModel"].packageLists).toEqual(expectedPackageLists)
		})

		it("shorten too long pathName in middle of the string for legendPanel", () => {
			services.settingsService.settings.fileSettings.markedPackages = [
				{ color: "#FF0000", path: "/root/a/longNameToBeShortenedInLegend", attributes: {} }
			]
			const shortenedPathname = "longNameToBe...enedInLegend"

			legendPanelController.onSettingsChanged(services.settingsService.settings, null)
			expect(legendPanelController["_viewModel"].packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname)
		})

		it("shorten too long pathName at beginning of the string for legendPanel", () => {
			services.settingsService.settings.fileSettings.markedPackages = [
				{ color: "#FF0000", path: "/root/a/andAnotherLongNameToShorten", attributes: {} }
			]
			const shortenedPathname = ".../andAnotherLongNameToShorten"

			legendPanelController.onSettingsChanged(services.settingsService.settings, null)
			expect(legendPanelController["_viewModel"].packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname)
		})
	})
})
