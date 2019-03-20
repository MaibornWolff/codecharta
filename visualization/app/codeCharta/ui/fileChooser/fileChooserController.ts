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

    // TODO: import doesnt work yet
    public fileChanged(element) {
        this.$rootScope.$broadcast("add-loading-task");
        this.$scope.$apply(() => {
            let nameDataPairs: NameDataPair[] = []

            for (let i = 0; i < element.files.length; i++) {
                ((file, i) => {
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        console.log("jo")
                        nameDataPairs.push({
                            fileName: file.name,
                            content: JSON.parse((<any>event.target).result)
                        })
                        console.log("NameDataPairs1", nameDataPairs)
                    };
                    reader.readAsText(file, "UTF-8");
                })(element.files[i], i);
            }

            /*for (let file of element.files) {
                let reader = new FileReader()
                console.log("reader", reader)

                reader.onload = (event) => {


                };
                //reader.readAsText(file, "UTF-8");
            }*/
            console.log("NameDataPairs2", nameDataPairs)

            this.fileStateService.resetMaps()
            // TODO: Reset fileSettings, dynamicSettings etc... markedPackages
            this.codeChartaService.loadFiles(nameDataPairs)
                .then(() => {
                    this.$rootScope.$broadcast("remove-loading-task");
                })
                .catch(e => {
                    this.$rootScope.$broadcast("remove-loading-task");
                    console.error(e);
                    this.printErrors(e)
                })

        });
    }

    private printErrors(errors: Object) {
        this.dialogService.showErrorDialog(JSON.stringify(errors, null, "\t"))
    }

}

export {FileChooserController};


