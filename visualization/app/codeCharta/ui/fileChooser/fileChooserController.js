"use strict";

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
    constructor($scope, dataLoadingService){

        /**
         *
         * @type {Scope}
         */
        this.$scope = $scope;

        /**
         *
         * @type {DataLoadingService}
         */
        this.service = dataLoadingService;
    }

    /**
     * called when the selected file changed
     * @param {object} element dom input element
     */
    fileChanged(element) {
        let ctx = this;
        console.log("loading revision " + ctx.$scope.ctrl.revision);
        this.$scope.$apply(function() {
            var file = element.files[0];
            var reader = new FileReader();
            reader.onload = function(e) {
                ctx.onNewFileLoaded(e.target.result, ctx.$scope.ctrl.revision);
            };
            reader.readAsText(file, "UTF-8");
        });
    }

    /**
     * called when the new file was loaded
     * @param {object} data fileData
     */
    onNewFileLoaded(data, revision){
        $("#fileChooserPanel").modal("close");

        try {
            data = JSON.parse(data);
        }
        catch (e) {
            window.alert("Error parsing JSON!" + e);
            return;
        }

        this.setNewData(data, revision);

    }

    /**
     * Sets the new data in dataService
     * @param {object} parsedData
     */
    setNewData(parsedData, revision){
        let ctx = this;
        this.service.loadMapFromFileContent(parsedData, revision).then(
            () => {
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
        window.alert("Wrong format. See console logs for details.");
        result.errors.forEach((e)=>{
            console.log(e.message + " @ " + e.dataPath);
        });
    }
    
}

export {FileChooserController};


