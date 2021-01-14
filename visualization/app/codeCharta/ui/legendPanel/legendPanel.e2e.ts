import { goto } from "../../../puppeteer.helper"
import { LegendPanelObject } from "./legendPanel.po"
import { FileChooserPageObject } from "../fileChooser/fileChooser.po"
import { LegendPanelController } from "./legendPanel.component"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("CustomConfigs", () => {
	let legendPanelObject: LegendPanelObject
	let fileChooser: FileChooserPageObject
	let legendPanelController: LegendPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(async () => {
		legendPanelObject = new LegendPanelObject()
		fileChooser = new FileChooserPageObject()

		instantiateModule("app.codeCharta.ui.legendPanel")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		legendPanelController = new LegendPanelController($rootScope, storeService)

		await goto()
	})

	describe("LegendPanel", () => {
		it("should highlight a folder and add to legend then react to a changed color", async () => {
			await fileChooser.openFiles(["./app/codeCharta/ressources/sample1_with_different_edges.cc.json"])
			await legendPanelObject.open()

			let markedPackages = [{ color: "#FF0000", path: "/root" }]
			legendPanelController.onMarkedPackagesChanged(markedPackages)

			markedPackages = [{ color: "#1D8EFF", path: "/root" }]
			legendPanelController.onMarkedPackagesChanged(markedPackages)

			await legendPanelObject.checkNodeColor()
		})
	})
})
