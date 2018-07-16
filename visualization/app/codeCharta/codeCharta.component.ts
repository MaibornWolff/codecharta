import {DataLoadingService} from "./core/data/data.loading.service";
import {UrlService} from "./core/url/url.service";
import {SettingsService} from "./core/settings/settings.service";
import {ScenarioService} from "./core/scenario/scenario.service";
import {DataService} from "./core/data/data.service";
import $ from "jquery";
import {IRootScopeService} from "angular";
import "./codeCharta.component.scss";
import {DialogService} from "./ui/dialog/dialog.service";
import {queryParamDialog} from "./ui/dialog/queryParam.dialog";
import {ThreeOrbitControlsService} from "./ui/codeMap/threeViewer/threeOrbitControlsService";
import {nodeContextMenuComponent, NodeContextMenuComponent} from "./ui/nodeContextMenu/nodeContextMenu.component";


/**
 * This is the main controller of the CodeCharta application
 */
export class CodeChartaController {

    public viewModel = {
        version: require("../../package.json").version,
        numberOfLoadingTasks: 0
    };

    /* @ngInject */
    constructor(
        private dataLoadingService: DataLoadingService,
        private urlService: UrlService,
        private settingsService: SettingsService,
        private scenarioService: ScenarioService,
        private dataService: DataService,
        private threeOrbitControlsService: ThreeOrbitControlsService,
        private $mdSidenav: any,
        private $rootScope: IRootScopeService,
        private dialogService: DialogService
    ) {
        this.subscribeToLoadingEvents($rootScope);
        this.loadFileOrSample();
        this.initContextMenuCloseHandler();
    }

    private initContextMenuCloseHandler() {
        document.body.addEventListener('click', ()=>NodeContextMenuComponent.hide(this.$rootScope), true);
    }

    private subscribeToLoadingEvents($rootScope: angular.IRootScopeService) {
        $rootScope.$on("add-loading-task", () => {
            this.viewModel.numberOfLoadingTasks++;
        });

        $rootScope.$on("remove-loading-task", () => {
            this.viewModel.numberOfLoadingTasks--;
        });
    }

    fitMapToView() {
        this.threeOrbitControlsService.autoFitTo();
    }

    toggleSidenav(navID) {
        this.$mdSidenav(navID).toggle();
    }

    showUrlParams() {
        this.dialogService.showQueryParamDialog();
    }

    loadFileOrSample() {
        this.viewModel.numberOfLoadingTasks++;
        this.urlService.getFileDataFromQueryParam().then(
            (data)=>{
                this.trySettingGivenData(this.urlService.getParam("file"), data);
            },
            ()=>{
                if(this.urlService.getParam("file")){
                    this.dialogService.showErrorDialog("File from the given file URL parameter could not be loaded. Loading sample files instead.");
                }
                this.tryLoadingSampleFiles();
            }
        );
    }

    private trySettingGivenData(name, data) {
        this.dataLoadingService.loadMapFromFileContent(name, data, 0).then(
            () => {
                this.loadingFinished();
                this.settingsService.updateSettingsFromUrl();
                this.viewModel.numberOfLoadingTasks--;
            },
            (r) => {
                this.printErrors(r);
                this.viewModel.numberOfLoadingTasks--;
            }
        );
    }

    private tryLoadingSampleFiles() {
        Promise.all([
            this.dataLoadingService.loadMapFromFileContent("sample1.json", require("./assets/sample1.json"), 0),
            this.dataLoadingService.loadMapFromFileContent("sample2.json", require("./assets/sample2.json"), 1)
        ]).then(
            () => {
                this.loadingFinished();
                this.settingsService.updateSettingsFromUrl();
                this.viewModel.numberOfLoadingTasks--;
            },
            (r) => {
                this.printErrors(r);
                this.viewModel.numberOfLoadingTasks--;
            }
        );
    }

    loadingFinished() {
        this.scenarioService.applyScenario(this.scenarioService.getDefaultScenario());
        this.dataService.setComparisonMap(0);
        this.dataService.setReferenceMap(0);
    }

    printErrors(errors: Object) {
        this.dialogService.showErrorDialog(JSON.stringify(errors, null, "\t"));
    }

}

export const codeChartaComponent = {
    selector: "codeChartaComponent",
    template: require("./codeCharta.component.html"),
    controller: CodeChartaController
};



