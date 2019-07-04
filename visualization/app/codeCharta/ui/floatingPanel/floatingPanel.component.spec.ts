import "./floatingPanel.module"
import { FloatingPanelController } from "./floatingPanel.component"
import {instantiateModule, getService} from "../../../../mocks/ng.mockhelper"
import { SettingsService } from "../../state/settings.service";
import { IRootScopeService } from "angular";
import { RecursivePartial, Settings, FloatingPanelMode } from "../../codeCharta.model";

describe("FloatingPanelController", () => {

    let floatingPanelController: FloatingPanelController
    let $rootScope: IRootScopeService

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.floatingPanel")
        $rootScope = getService<IRootScopeService>("$rootScope")
    }

    function rebuildController() {
        floatingPanelController = new FloatingPanelController($rootScope)
    }

    describe("Show components selected", () => {
        it("should set floatingPanelMode correctly", () => {
            let update: RecursivePartial<Settings> = {dynamicSettings: {floatingPanelMode: FloatingPanelMode.treeView}} 

            floatingPanelController.onSettingsChanged(null, update, null)

            expect(floatingPanelController["_viewModel"].floatingPanelMode).toBe(FloatingPanelMode.treeView)
        })

        it("should set floatingPanelMode to none", () => {
            let update: RecursivePartial<Settings> = {dynamicSettings: {floatingPanelMode: FloatingPanelMode.search}} 

            floatingPanelController.onSettingsChanged(null, update, null)

            expect(floatingPanelController["_viewModel"].floatingPanelMode).toBe(FloatingPanelMode.search)
        })
    })

});