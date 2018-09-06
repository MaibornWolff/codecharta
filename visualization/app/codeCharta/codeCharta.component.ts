import {DataLoadingService} from "./core/data/data.loading.service";
import {NameDataPair, UrlService} from "./core/url/url.service";
import {SettingsService} from "./core/settings/settings.service";
import {ScenarioService} from "./core/scenario/scenario.service";
import {DataService} from "./core/data/data.service";
import $ from "jquery";
import {IRootScopeService} from "angular";
import "./codeCharta.component.scss";
import {DialogService} from "./ui/dialog/dialog.service";
import {queryParamDialog} from "./ui/dialog/queryParam.dialog";
import {ThreeOrbitControlsService} from "./ui/codeMap/threeViewer/threeOrbitControlsService";
import {NodeContextMenuComponent} from "./ui/nodeContextMenu/nodeContextMenu.component";

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

    loadFileOrSample() {
        this.viewModel.numberOfLoadingTasks++;
        return this.urlService.getFileDataFromQueryParam().then(
            (data: NameDataPair[])=>{
                if(data.length > 0) {
                    this.tryLoadingFiles(data);
                } else {
                    this.tryLoadingSampleFiles();
                }
            },
            this.tryLoadingSampleFiles.bind(this)
        );
    }

    tryLoadingFiles(nameDataPairs: NameDataPair[], applyScenarioOnce = true) {

        let tasks = [];

        nameDataPairs.forEach((o, i)=>{
           tasks.push(
               this.dataLoadingService.loadMapFromFileContent(o.name, o.data, i)
           );
        });

        return Promise.all(tasks).then(
            () => {
                if(applyScenarioOnce) {
                    this.scenarioService.applyScenarioOnce(this.scenarioService.getDefaultScenario());
                } else {
                    this.scenarioService.applyScenario(this.scenarioService.getDefaultScenario());
                }
                this.dataService.setComparisonMap(0);
                this.dataService.setReferenceMap(0);
                this.settingsService.updateSettingsFromUrl();
                this.viewModel.numberOfLoadingTasks--;
            },
            (r) => {
                this.printErrors(r);
                this.viewModel.numberOfLoadingTasks--;
            }
        );

    }

    tryLoadingSampleFiles() {
        if(this.urlService.getParam("file")){
            this.dialogService.showErrorDialog("One or more files from the given file URL parameter could not be loaded. Loading sample files instead.");
        }
        return this.tryLoadingFiles([
            { name: "sample1.json", data: require("./assets/sample1.json") },
            { name: "sample2.json", data: require("./assets/sample2.json") },
        ], false);

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



