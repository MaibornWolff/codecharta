"use strict";

/* We need to override this jshint suggestion because we need to attach a callback function to an object with values
only available in the loop. We cannot use a named function with parameters because the filereader object wont call it
with the additional ones */

/*jshint loopfunc:true */

import {SettingsService} from "../../core/settings/settings.service";
import {DialogService} from "../dialog/dialog.service";
import {DataService} from "../../core/data/data.service";
import {ScenarioService} from "../../core/scenario/scenario.service";
import {DataLoadingService} from "../../core/data/data.loading.service";

/**
 * Controls the FileChooser
 */
class FileChooserController {

    /* @ngInject */

    constructor(
        private $scope,
        private dataLoadingService: DataLoadingService,
        private scenarioService: ScenarioService,
        private dataService: DataService,
        private $rootScope,
        private dialogService: DialogService,
        private settingsService: SettingsService,
    ){
    }

    /**
     * called when the selected file changed
     * @param {object} element dom input element
     */
    public fileChanged(element) {
        this.$rootScope.$broadcast("add-loading-task");
        this.$scope.$apply(() => {
            this.dataService.resetMaps();
            for (let i = 0; i < element.files.length; i++) {
                ((file, i) => {
                    let name = file.name;
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        this.onNewFileLoaded((<any>e.target).result, i, name, element);
                    };
                    reader.readAsText(file, "UTF-8");
                })(element.files[i], i);
            }

        });
    }

    /**
     * called when the new file was loaded
     *
     * @param {object} data map data
     * @param {number} revision the revision number
     * @param {string} name the filename
     */
    public onNewFileLoaded(data, revision, name, element){
        element.value = "";
        //$("#fileChooserPanel").modal("close");

        try {
            const parsed = JSON.parse(data);
            this.setNewData(name, parsed, revision);
        }
        catch (e) {
            this.dialogService.showErrorDialog("Error parsing JSON!" + e);
            this.$rootScope.$broadcast("remove-loading-task");
            return;
        }

        this.$rootScope.$broadcast("remove-loading-task");
    }

    /**
     * Sets the new data in dataService
     * @param {string} name the filename
     * @param {object} parsedData
     * @param {number} revision the revision number
     */
    public setNewData(name, parsedData, revision){
        let ctx = this;
        return this.dataLoadingService.loadMapFromFileContent(name, parsedData, revision).then(
            () => {

                ctx.scenarioService.applyScenarioOnce(this.scenarioService.getDefaultScenario());
                ctx.dataService.setComparisonMap(revision);
                ctx.dataService.setReferenceMap(revision);
                if (ctx.settingsService.settings) {
                    ctx.settingsService.settings.markedPackages = [];
                }
                ctx.settingsService.applySettings(ctx.settingsService.settings);

                if(!ctx.$scope.$$phase || !ctx.$scope.$root.$$phase) {
                    ctx.$scope.$digest();
                }
            },
            (r) => {
                ctx.printErrors(r);
            }
        );

    }

    /**
     * prints errors
     * @param {object} result
     */
    public printErrors(result){
        this.dialogService.showErrorDialog(JSON.stringify(result, null, "\t"));
    }
    
}

export {FileChooserController};


