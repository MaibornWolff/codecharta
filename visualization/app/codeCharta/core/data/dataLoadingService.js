"use strict";

import {CodeMap} from "./model/codeMap.js";

/**
 * This service loads maps into the DataService
 */
class DataLoadingService {

    /* @ngInject */
    constructor($rootScope, dataValidatorService, dataService){

        /**
         * Angular rootScope
         * @type {Scope}
         */
        this.$rootScope = $rootScope;

        /**
         * Reference to a dataValidatorService
         * @type {DataValidatorService}
         */
        this.validator = dataValidatorService;

        /**
         * Reference to the data service
         * @type {DataService}
         */
        this.storage = dataService;

    }

    /**
     * Validates and loads a map from the given file content into the dataService
     * @param {Object} fileContent well formed (schema.json) fileContent
     * @param {Number} revision the revision id
     * @returns {Promise} which resolves when the filecontent is valid and stored in dataService.
     * The Promise rejects when errors happen. The errors are provided as parameters of the rejection function
     */
    loadMapFromFileContent(fileContent, revision) {

        if (!revision) {
            revision = 0;
        }

        return new Promise((resolve, reject) => {

            this.validator.validate(fileContent).then(

                ()=>{
                    //TODO get Filename
                    //This is the part were the validated JSON file is put into a data structure
                    const map = new CodeMap("Filename_TBD", fileContent.projectName, fileContent.nodes[0]); //TODO check it
                    this.storage.setMap(map, revision);

                    resolve(map);

                }, (errors) => {
                    reject(errors);
                }

            );

        });

    }


    
}

export {DataLoadingService};
