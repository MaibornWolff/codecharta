import "./searchPanel.module"
import { SearchPanelController } from "./searchPanel.component"
import {instantiateModule, getService} from "../../../../mocks/ng.mockhelper"
import { SettingsService } from "../../state/settings.service";
import { IRootScopeService } from "angular";
import { RecursivePartial, Settings, SearchPanelMode } from "../../codeCharta.model";

describe("SearchPanelController", () => {

    let searchPanelModeController: SearchPanelController
    let $rootScope: IRootScopeService
    let settingsService: SettingsService

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.searchPanel")
        $rootScope = getService<IRootScopeService>("$rootScope")
        settingsService = getService<SettingsService>("settingsService")
    }

    function rebuildController() {
        searchPanelModeController = new SearchPanelController($rootScope, settingsService)
    }

    describe("Show components selected", () => {
        it("should set searchPanelMode correctly", () => {
            let update: RecursivePartial<Settings> = {dynamicSettings: {searchPanelMode: SearchPanelMode.treeView}} 

            searchPanelModeController.onSettingsChanged(null, update, null)

            expect(searchPanelModeController["_viewModel"].searchPanelMode).toBe(SearchPanelMode.treeView)
        })

        it("should set searchPanelMode to none", () => {
            let update: RecursivePartial<Settings> = {dynamicSettings: {searchPanelMode: SearchPanelMode.minimized}} 

            searchPanelModeController.onSettingsChanged(null, update, null)

            expect(searchPanelModeController["_viewModel"].searchPanelMode).toBe(SearchPanelMode.minimized)
        })
    })

});