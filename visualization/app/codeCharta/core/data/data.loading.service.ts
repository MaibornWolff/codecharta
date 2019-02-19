"use strict";
import {CodeMap} from "./model/CodeMap";
import {DataValidatorService} from "./data.validator.service";
import {DataService} from "./data.service";

/**
 * This service loads maps into the DataService
 */
export class DataLoadingService {

    /* @ngInject */
    constructor(private dataValidatorService: DataValidatorService, private dataService: DataService){

    }

    /**
     * Validates and loads a map from the given file content into the dataService
     * @param {Object} fileContent well formed (schema.json) fileContent
     * @param {Number} revision the revision id
     * @returns {Promise} which resolves when the filecontent is valid and stored in dataService.
     * The Promise rejects when errors happen. The errors are provided as parameters of the rejection function
     */
    public loadMapFromFileContent(fileName: string, fileContent: any, revision: number = 0): Promise<CodeMap> {

        return new Promise((resolve, reject) => {

            this.dataValidatorService.validate(fileContent).then(

                ()=>{
                    const map: CodeMap = {
                        fileName: fileName, 
                        projectName: fileContent.projectName,
                        apiVersion: fileContent.apiVersion,
                        nodes: fileContent.nodes[0],
                        edges: fileContent.edges || [],
                        attributeTypes: fileContent.attributeTypes || {},
                        blacklist: fileContent.blacklist || [],
                    };
                    this.dataService.setMap(map, revision);

                    resolve(map);

                }, (errors) => {
                    reject(errors);
                }

            );

        });

    }


    
}
