"use strict";

/* We need to override this jshint suggestion because we need to attach a callback function to an object with values
only available in the loop. We cannot use a named function with parameters because the filereader object wont call it
with the additional ones */

/*jshint loopfunc:true */

/**
 * Controls the FileChooser
 */
class FileChooserController {

    /* @ngInject */

    /**
     * @constructor
     * @param {Scope} $scope
     * @param {DataLoadingService} dataLoadingService
     */
    constructor($scope, dataLoadingService, scenarioService, dataService, $rootScope){

        /**
         *
         * @type {Scope}
         */
        this.$scope = $scope;

        /**
         *
         * @type {IRootScopeService}
         */
        this.$rootScope = $rootScope;

        /**
         *
         * @type {DataLoadingService}
         */
        this.service = dataLoadingService;

        this.scenarioService = scenarioService;
        this.dataService = dataService;
    }

    /**
     * called when the selected file changed
     * @param {object} element dom input element
     */
    fileChanged(element) {
        let ctx = this;
        this.$rootScope.$broadcast("add-loading-task");
        this.$scope.$apply(function() {
            ctx.dataService.resetMaps();
            for (let i = 0; i < element.files.length; i++) {
                (function(file, i) {
                    var name = file.name;
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        ctx.onNewFileLoaded(e.target.result, i, name, element);
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
    onNewFileLoaded(data, revision, name, element){
        element.value = "";
        $("#fileChooserPanel").modal("close");

        try {
            data = JSON.parse(data);
        }
        catch (e) {
            window.alert("Error parsing JSON!" + e);
            this.$rootScope.$broadcast("remove-loading-task");
            return;
        }

        this.$rootScope.$broadcast("remove-loading-task");
        this.setNewData(name, data, revision);

    }

    /**
     * Sets the new data in dataService
     * @param {string} name the filename
     * @param {object} parsedData
     * @param {number} revision the revision number
     */
    setNewData(name, parsedData, revision){
        let ctx = this;
        this.service.loadMapFromFileContent(name, parsedData, revision).then(
            () => {

                ctx.dataService.setComparisonMap(revision);

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
    printErrors(result){
        console.log(result);
    }
    
}

export {FileChooserController};


