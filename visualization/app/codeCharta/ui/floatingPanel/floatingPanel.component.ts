import "./floatingPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service";
import { IRootScopeService, IAngularEvent } from "angular";
import { Settings, RecursivePartial, structureViewMode } from "../../codeCharta.model";

export class FloatingPanelController implements SettingsServiceSubscriber{
    private _viewModel: {structureView: structureViewMode} = {
        structureView: structureViewMode.none
    }

    /* @ngInject */
    constructor($rootScope: IRootScopeService) {
        SettingsService.subscribe($rootScope, this)
    }

    public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: IAngularEvent){
        if(this.isStructureViewUpdated(update)){
            this._viewModel.structureView = update.dynamicSettings.structureView
        }
    }

    private isStructureViewUpdated(update: RecursivePartial<Settings>) {
		return update.dynamicSettings && update.dynamicSettings.structureView !== undefined
	}

}

export const floatingPanelComponent = {
    selector: "floatingPanelComponent",
    template: require("./floatingPanel.component.html"),
    controller: FloatingPanelController
}