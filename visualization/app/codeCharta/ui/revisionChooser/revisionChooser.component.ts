import { SettingsService } from "../../state/settings.service"
import "./revisionChooser.component.scss"
import "./revisionChooserFileDropDown.component.scss"
import {CCFile, RenderMode, Settings} from "../../codeCharta.model";
import {SettingsServiceSubscriber} from "../../state/settings.service";
import {CodeChartaService} from "../../codeCharta.service";
import {IRootScopeService} from "angular";

/**
 * Controls the RevisionChooser
 */
export class RevisionChooserController implements SettingsServiceSubscriber {

    public importedFiles: CCFile[];
    public settings: Settings;
    private _viewModel = {
        allRenderModes: RenderMode,
        renderMode: null,
        chosenReference: null,
        chosenComparison: null
    }

    /* @ngInject */
    constructor(
        private codeChartaService: CodeChartaService,
        private settingsService: SettingsService,
        private $rootScope: IRootScopeService
    ) {
        this.importedFiles = this.codeChartaService.getImportedFiles();
        this.settings = this.settingsService.getSettings();

        // TODO: Set comparisonMap
        //this._viewModel.chosenComparison = this.dataService.getIndexOfMap(this.dataService.getComparisonMap(), this.importedFiles);
        //this._viewModel.chosenReference = this.dataService.getIndexOfMap(this.codeChartaService.getRenderMap(), this.importedFiles);
        this.$rootScope.$on("revision-mode-changed", (event, data)=>{
            this._viewModel.allRenderModes = data;
        });
        SettingsService.subscribe(this.$rootScope, this)

    }

    public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
        this._viewModel.renderMode = settings.dynamicSettings.renderMode;
    }

    //TODO listen to on imported files changed
    /*public onDataChanged(data: DataModel) {
        this.revisions = data.revisions;
        this.ui.chosenComparison= this.dataService.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions);
        this.ui.chosenReference = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
    }

    public onReferenceChange(mapIndex: number) {
        this.dataService.setReferenceMap(mapIndex);
    }

    public onComparisonChange(mapIndex: number) {
        this.dataService.setComparisonMap(mapIndex);
    }*/



    public onShowChange(){
        this.settingsService.updateSettings({
            dynamicSettings: {
                renderMode: this._viewModel.renderMode
            }
        });
     }
}

export const revisionChooserComponent = {
	selector: "revisionChooserComponent",
	template: require("./revisionChooser.component.html"),
	controller: RevisionChooserController
}
export const revisionChooserFileDropDownComponent = {
	selector: "revisionChooserFileDropDownComponent",
	template: require("./revisionChooserFileDropDown.component.html"),
	controller: RevisionChooserController
}
