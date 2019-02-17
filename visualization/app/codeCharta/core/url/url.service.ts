"use strict";
import {ILocationService, IHttpService, IHttpResponse} from "angular";

export interface NameDataPair {
    name: string;
    data: Object;
}

/**
 * This service offers an application specific url API.
 */
export class UrlService {

    public static SELECTOR = "urlService";

    private static OK_CODE = 200;

    /* @ngInject */
    constructor(private $location: ILocationService, private $http: IHttpService) {
    }

    /**
     * returns an url parameter value by its key.
     * @param {string} key
     * @returns {string} url parameter value
     */
    public getParam(key: string): string {
        return this.getParameterByName(key);
    }

    /**
     * returns an url parameter value by its name/key.
     * @param {string} name
     * @param {string} [url=current location]
     * @returns {string} url parameter value
     */
    public getParameterByName(name: string, url: string = this.getUrl()): string {
        const sanitizedName = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + sanitizedName + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) {
            return null;
        }
        if (!results[2]) {
            return "";
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    /**
     * returns the current locations url
     * @returns {string} url
     */
    public getUrl(): string {
        return this.$location.absUrl();
    }

    /**
     * returns the files contents specified in the 'file' url parameter
     * @returns {Promise} which returns the files content on resolution
     */
    public getFileDataFromQueryParam(): Promise<NameDataPair[]> {

        let fileNames = this.$location.search().file;

        if(!fileNames) {
            fileNames = [];
        }

        if(fileNames.push === undefined) {
            fileNames = [fileNames];
        }

        let fileReadingTasks = [];

        fileNames.forEach((fileName)=>{
            fileReadingTasks.push(new Promise((resolve, reject) => {
                this.getFileDataFromFile(fileName).then(resolve, reject);
            }));
        });

        return Promise.all(fileReadingTasks);

    }

    /**
     * returns the files content specified in the 'file' parameter
     * @returns {Promise} which returns the files content on resolution
     */
    public getFileDataFromFile(file: string): Promise<NameDataPair> {

        return new Promise((resolve, reject) => {

            if (file && file.length > 0) {
                this.$http.get(file).then(
                    (response: IHttpResponse<Object>) => {
                        if (response.status === UrlService.OK_CODE) {
                            Object.assign(response.data, {fileName: file});
                            resolve({name: file, data:response.data});
                        } else {
                            reject();
                        }
                    }, reject
                );
            } else {
                reject();
            }

        });

    }

}