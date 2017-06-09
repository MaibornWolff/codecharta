"use strict";

import * as d3 from "d3";
import {CodeMap} from "./model/codeMap.js";

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
         * Reference to the storage service
         * @type {DataService}
         */
        this.storage = dataService;

    }

    loadMapFromFileContent(fileContent, revision) {

        if (!revision) {
            revision = 0;
        }

        return new Promise((resolve, reject) => {

            this.validator.validate(fileContent).then(

                ()=>{

                    const map = new CodeMap(fileContent);
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
