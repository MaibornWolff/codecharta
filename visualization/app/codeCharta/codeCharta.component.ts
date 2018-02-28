"use strict";
import {DataLoadingService} from "./core/data/data.loading.service";
import {UrlService} from "./core/url/url.service";
import {SettingsService} from "./core/settings/settings.service";
import {ScenarioService} from "./core/scenario/scenario.service";
import {DataService} from "./core/data/data.service";
import $ from "jquery";
import {IRootScopeService} from "angular";
import "./codeCharta.component.scss";


/**
 * This is the main controller of the CodeCharta application
 */
export class CodeChartaController {

    private pkg: Object;
    private numberOfLoadingTasks = 0;

    /* @ngInject */
    constructor(
        private dataLoadingService: DataLoadingService,
        private urlService: UrlService,
        private settingsService: SettingsService,
        private scenarioService: ScenarioService,
        private dataService: DataService,
        private $mdSidenav: any,
        private $rootScope: IRootScopeService
    ) {
        this.init();

        //Loading tasks
        $rootScope.$on("add-loading-task", ()=>{
            this.numberOfLoadingTasks++;
        });

        $rootScope.$on("remove-loading-task", ()=>{
            this.numberOfLoadingTasks--;
        });

    }

    init() {
        this.initHandlers();
        this.loadFileOrSample();
        this.pkg = require("../../package.json");
    }

    toggleSidenav(navID) {
        this.$mdSidenav(navID).toggle();
    }

    showUrlParams() {
        window.prompt("Copy to clipboard: Ctrl+C", this.settingsService.getQueryParamString());
    }

    /**
     * Tries to load the file specified in the given url. Loads sample data if it fails.
     */
    loadFileOrSample() {

        this.numberOfLoadingTasks++;

        this.urlService.getFileDataFromQueryParam().then(

            //try loading from url param

            //successfully loaded
            (data) => {

                // set loaded data
                this.dataLoadingService.loadMapFromFileContent(this.urlService.getParam("file"), data, 0).then(
                    () => {
                        this.loadingFinished();
                        this.settingsService.updateSettingsFromUrl();
                        this.numberOfLoadingTasks--;
                    },
                    (r) => {
                        this.printErrors(r);
                        this.numberOfLoadingTasks--;
                    }
                );

            },

            //fail
            () => {

                Promise.all([
                    this.dataLoadingService.loadMapFromFileContent("sample1.json", require("./assets/sample1.json"), 0),
                    this.dataLoadingService.loadMapFromFileContent("sample2.json", require("./assets/sample2.json"), 1)
                ]).then(
                    () => {
                        this.loadingFinished();
                        this.settingsService.updateSettingsFromUrl();
                        this.numberOfLoadingTasks--;
                    },
                    (r) => {
                        this.printErrors(r);
                        this.numberOfLoadingTasks--;
                    }
                );

            }

        );

    }

    /**
     * called after map loading finished. Applies the default scenario.
     */
    loadingFinished() {
        this.scenarioService.applyScenario(this.scenarioService.getDefaultScenario());
        this.dataService.setComparisonMap(0);
        this.dataService.setReferenceMap(0);
    }

    /**
     * initializes keypress handlers
     */
    initHandlers() {

        //noinspection TypeScriptUnresolvedFunction
        $(window).keyup(function (event) {
            if (event.which === 116) {
                window.location.reload();
            }
        });

        //noinspection TypeScriptUnresolvedFunction
        $(window).keypress(function (event) {
            if (event.which === 18 && (event.ctrlKey || event.metaKey)) {
                window.location.reload();
            }
        });

    }

    /**
     * Prints errors to the browser console and alerts the user
     * @param {Object} errors an errors object
     */
    printErrors(errors: Object) {
        window.alert("Wrong format. See console logs for details.");
        console.log(errors);
    }

}

export const codeChartaComponent = {
    selector: "codeChartaComponent",
    template: require("./codeCharta.component.html"),
    controller: CodeChartaController
};



