import "./floatingPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service";
import { IRootScopeService, IAngularEvent } from "angular";
import { Settings, RecursivePartial, structureViewMode } from "../../codeCharta.model";

export class FloatingPanelController implements SettingsServiceSubscriber{
    private _viewModel = {
        structureView: structureViewMode.None
    }

    /* @ngInject */
    constructor(private settingsService: SettingsService, private $rootScope: IRootScopeService) {
        SettingsService.subscribe($rootScope, this)
    }

    public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: IAngularEvent){
        this._viewModel.structureView = settings.dynamicSettings.structureView
    }

}

export const floatingPanelComponent = {
    selector: "floatingPanelComponent",
    template: require("./floatingPanel.component.html"),
    controller: FloatingPanelController
}