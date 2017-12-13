"use strict";

/**
 * This is the main controller of the CodeCharta application
 */
class CodeChartaController {

    /* @ngInject */

    /**
     * @constructor
     * @param {UrlService} urlService
     * @param {DataLoadingService} dataLoadingService
     * @param {SettingsService} settingsService
     */
    constructor(dataLoadingService, urlService, settingsService, scenarioService, dataService) {
        this.initHandlers();
        this.loadFileOrSample(urlService, dataLoadingService, settingsService);
        this.scenarioService = scenarioService;
        this.dataService = dataService;
        this.pkg = require("../../package.json");
    }

    /**
     * Tries to load the file specified in the given url. Loads sample data if it fails.
     * @param {UrlService} urlService
     * @param {DataLoadingService} dataLoadingService
     * @param {SettingsService} settingsService
     */
    loadFileOrSample(urlService, dataLoadingService, settingsService) {

        let ctx = this;

        urlService.getFileDataFromQueryParam().then(

            //try loading from url param

            //successfully loaded
            (data) => {

                // set loaded data
                dataLoadingService.loadMapFromFileContent(urlService.getParam("file"), data, 0).then(
                    () => {
                        ctx.loadingFinished();
                        settingsService.updateSettingsFromUrl();
                    },
                    (r) => {
                        ctx.printErrors(r);
                    }
                );

            },

            //fail
            () => {

                //try to load sample data
                dataLoadingService.loadMapFromFileContent("sample1.json", require("./sample1.json"), 0).then(
                    () => {
                        ctx.loadingFinished();
                        settingsService.updateSettingsFromUrl();
                    },
                    (r) => {
                        ctx.printErrors(r);
                    }
                );

                //try to load sample data
                dataLoadingService.loadMapFromFileContent("sample2.json", require("./sample2.json"), 1).then(
                    () => {
                        ctx.loadingFinished();
                    },
                    (r) => {
                        ctx.printErrors(r);
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

        $(window).keyup(function (event) {
            if (event.which === 116) {
                window.location.reload();
            }
        });

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
    printErrors(errors) {
        window.alert("Wrong format. See console logs for details.");
        console.log(errors);
    }

}

export {CodeChartaController};


