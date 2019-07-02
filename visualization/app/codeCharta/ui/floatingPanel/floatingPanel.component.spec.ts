import "./floatingPanel.module"
import { FloatingPanelController } from "./floatingPanel.component"
import {instantiateModule, getService} from "../../../../mocks/ng.mockhelper"
import { SettingsService } from "../../state/settings.service";
import { IRootScopeService } from "angular";
import { RecursivePartial, Settings, structureViewMode } from "../../codeCharta.model";

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
        it("should set structureView correctly", () => {
            let update: RecursivePartial<Settings> = {dynamicSettings: {structureView: structureViewMode.treeView}} 

            floatingPanelController.onSettingsChanged(null, update, null)

            expect(floatingPanelController["_viewModel"].structureView).toBe(structureViewMode.treeView)
        })

        it("should set structureView to none", () => {
            let update: RecursivePartial<Settings> = {dynamicSettings: {structureView: structureViewMode.none}} 

            floatingPanelController.onSettingsChanged(null, update, null)

            expect(floatingPanelController["_viewModel"].structureView).toBe(structureViewMode.none)
        })
    })

});