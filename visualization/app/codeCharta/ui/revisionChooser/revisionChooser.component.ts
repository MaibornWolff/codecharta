import {SettingsService} from "../../core/settings/settings.service";
import "./revisionChooser.component.scss";
import "./revisionChooserFileDropDown.component.scss";
import {RenderMode} from "../../codeCharta.model";

/**
 * Controls the RevisionChooser
 */
export class RevisionChooserController {

    public revisions: CodeMapNode[];
    public settings: Settings;
    public ui = {
        chosenReference: null,
        chosenComparison: null,
    };
    public show = RenderMode;

    /* @ngInject */
    constructor(
        private dataService: DataService,
        private settingsService: SettingsService,
        private $rootScope
    ) {
        this.revisions = dataService.data.revisions;
        this.settings = settingsService.settings;
        this.ui.chosenComparison = this.dataService.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions);
        this.ui.chosenReference = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
        dataService.subscribe(this);
        this.$rootScope.$on("revision-mode-changed", (event, data)=>{
            this.show = data;
        });

    }

    //TODO listen to on imported files changed
    public onDataChanged(data: DataModel) {
        this.revisions = data.revisions;
        this.ui.chosenComparison= this.dataService.getIndexOfMap(this.dataService.getComparisonMap(), this.revisions);
        this.ui.chosenReference = this.dataService.getIndexOfMap(this.dataService.getReferenceMap(), this.revisions);
    }

    public onReferenceChange(mapIndex: number) {
        this.dataService.setReferenceMap(mapIndex);
    }

    public onComparisonChange(mapIndex: number) {
        this.dataService.setComparisonMap(mapIndex);
    }



    public onShowChange(settings: Settings){
        this.settings = settings;
        this.settingsService.applySettings();

     }
}

export const revisionChooserComponent = {
    selector: "revisionChooserComponent",
    template: require("./revisionChooser.component.html"),
    controller: RevisionChooserController
};
export const revisionChooserFileDropDownComponent = {
    selector: "revisionChooserFileDropDownComponent",
    template: require("./revisionChooserFileDropDown.component.html"),
    controller: RevisionChooserController
};



