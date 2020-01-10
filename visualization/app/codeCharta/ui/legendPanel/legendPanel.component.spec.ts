import "./legendPanel.module"

import { LegendPanelController, PackageList } from "./legendPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"
import { CCFile, ColorRange } from "../../codeCharta.model"
import { TEST_FILE_DATA } from "../../util/dataMocks"
import _ from "lodash"
import { StoreService } from "../../state/store.service"

describe("LegendPanelController", () => {
	let legendPanelController: LegendPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let fileStateService: FileStateService

	let file: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.legendPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		fileStateService = getService<FileStateService>("fileStateService")

		file = _.cloneDeep(TEST_FILE_DATA)
	}

	function rebuildController() {
		legendPanelController = new LegendPanelController($rootScope, storeService, fileStateService)
	}

	describe("onMarkedPackagesChanged", () => {
		beforeEach(() => {
			fileStateService["fileStates"].push({ file, selectedAs: null })
		})

		it("set correct markingPackage in Legend", () => {
			const markedPackages = [{ color: "#FF0000", path: "/root", attributes: {} }]
			const expectedPackageLists: PackageList[] = [
				{
					colorPixel: "data:image/gif;base64,R0lGODlhAQABAPAAAP8AAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
					markedPackages: [{ color: "#FF0000", path: "/root", attributes: { name: "/root" } }]
				}
			]

			legendPanelController.onMarkedPackagesChanged(markedPackages)

			expect(legendPanelController["_viewModel"].packageLists).toEqual(expectedPackageLists)
		})

		it("shorten too long pathName in middle of the string for legendPanel", () => {
			const markedPackages = [{ color: "#FF0000", path: "/root/a/longNameToBeShortenedInLegend", attributes: {} }]
			const shortenedPathname = "longNameToBe...enedInLegend"

			legendPanelController.onMarkedPackagesChanged(markedPackages)
			expect(legendPanelController["_viewModel"].packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname)
		})

		it("shorten too long pathName at beginning of the string for legendPanel", () => {
			const markedPackages = [{ color: "#FF0000", path: "/root/a/andAnotherLongNameToShorten", attributes: {} }]
			const shortenedPathname = ".../andAnotherLongNameToShorten"

			legendPanelController.onMarkedPackagesChanged(markedPackages)
			expect(legendPanelController["_viewModel"].packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname)
		})
		it("should update the ColorRange when it is changed", () => {
			const newColorRange: ColorRange = { from: 13, to: 33 }

			legendPanelController.onColorRangeChanged(newColorRange)

			expect(legendPanelController["_viewModel"].colorRange).toEqual(newColorRange)
		})
	})

	describe("onColorRangeChanged", () => {
		it("should update the ColorRange when it is changed", () => {
			const newColorRange: ColorRange = { from: 13, to: 33 }

			legendPanelController.onColorRangeChanged(newColorRange)

			expect(legendPanelController["_viewModel"].colorRange).toEqual(newColorRange)
		})
	})
})
