"use strict";

/* We need to override this jshint suggestion because we need to attach a callback function to an object with values
only available in the loop. We cannot use a named function with parameters because the filereader object wont call it
with the additional ones */

/*jshint loopfunc:true */

import {SettingsService} from "../../state/settings.service";
import {DialogService} from "../dialog/dialog.service";
import {CodeChartaService} from "../../codeCharta.service";
import {FileStateService} from "../../state/fileState.service";
import {NameDataPair} from "../../util/urlUtils";
import {IRootScopeService} from "angular";

class FileChooserController {

    /* @ngInject */
    constructor(
        private $scope,
        private $rootScope: IRootScopeService,
        private dialogService: DialogService,
        private settingsService: SettingsService,
        private codeChartaService: CodeChartaService,
        private fileStateService: FileStateService
    ){
    }

    public fileChanged(element) {
        this.$rootScope.$broadcast("add-loading-task");
        this.$scope.$apply(() => {
            this.fileStateService.resetMaps()
            for(let file of element.files) {
                let reader = new FileReader()
                reader.onload = (event) => {
                    this.onNewFileLoaded(file.name, (<any>event.target).result)
                };
                reader.readAsText(file, "UTF-8");
            }
        });
    }

    public onNewFileLoaded(fileName: string, content: string){
        try {
            this.setNewData({
                fileName: fileName,
                content: JSON.parse(content)
            })
        }
        catch (error) {
            this.dialogService.showErrorDialog("Error parsing JSON!" + error)
            this.$rootScope.$broadcast("remove-loading-task")
        }
    }

    public setNewData(nameDataPair: NameDataPair){
        this.codeChartaService.loadFiles([nameDataPair])
            .then(() => {
                this.$rootScope.$broadcast("remove-loading-task")
            })
            .catch(e => {
                this.$rootScope.$broadcast("remove-loading-task")
                console.error(e)
                this.printErrors(e)
            })
    }

    private printErrors(errors: Object) {
        this.dialogService.showErrorDialog(JSON.stringify(errors, null, "\t"))
    }
}

export {FileChooserController};


