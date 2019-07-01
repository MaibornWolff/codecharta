import "./structurePanelSelector.component.scss"
import { SettingsServiceSubscriber, SettingsService } from "../../state/settings.service";
import { Settings, RecursivePartial, structureViewMode, BlacklistType } from "../../codeCharta.model";
import { IAngularEvent, IRootScopeService } from "angular";

export class StructurePanelSelectorController implements SettingsServiceSubscriber {

    private _viewModel: {structureView: structureViewMode, hideListLength: number, excludeListLength: number} = {
        structureView: structureViewMode.none,
        hideListLength: 0,
        excludeListLength: 0
    }

    /* @ngInject */
    constructor(private settingsService: SettingsService,
        private $rootScope: IRootScopeService) {
        SettingsService.subscribe(this.$rootScope, this)
    }

    public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: IAngularEvent){
        console.log("Settings changed to", settings.dynamicSettings.structureView)
        this._viewModel.structureView = settings.dynamicSettings.structureView
        this._viewModel.hideListLength = settings.fileSettings.blacklist.filter(x => x.type === BlacklistType.hide).length
        this._viewModel.excludeListLength = settings.fileSettings.blacklist.filter(x => x.type === BlacklistType.exclude).length
    }

    public onToggleStructureView(toggleView: structureViewMode){
        if ( toggleView === this._viewModel.structureView){
            this._viewModel.structureView = structureViewMode.none
        } else {
            this._viewModel.structureView = toggleView
        }

        this.settingsService.updateSettings({
			dynamicSettings: {
				structureView: this._viewModel.structureView
			}
		})
    }

}

export const structurePanelSelectorComponent = {
    selector: "structurePanelSelectorComponent",
    template: require("./structurePanelSelector.component.html"),
    controller: StructurePanelSelectorController
}