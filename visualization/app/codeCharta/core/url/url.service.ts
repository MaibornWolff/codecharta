"use strict";
import {ILocationService, IHttpService, IHttpResponse} from "angular";

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
    public getParameterByName(name: string, url?: string): string {
        if (!url) {
            url = this.getUrl();
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
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
     * returns the files content specified in the 'file' url parameter
     * @returns {Promise} which returns the files content on resolution
     */
    public getFileDataFromQueryParam(): Promise<Object> {

        return new Promise((resolve, reject) => {
            let param = this.getParam("file");
            this.getFileDataFromFile(param).then(resolve, reject);
        });

    }

    /**
     * returns the files content specified in the 'file' parameter
     * @returns {Promise} which returns the files content on resolution
     */
    public getFileDataFromFile(file: string): Promise<Object> {

        return new Promise((resolve, reject) => {

            if (file && file.length > 0) {
                this.$http.get(file).then(
                    function (response: IHttpResponse<Object>) {
                        if (response.status === UrlService.OK_CODE) {
                            Object.assign(response.data, {fileName: file});
                            resolve(response.data);
                        } else {
                            reject();
                        }
                    }, function () {
                        reject();
                    }
                );
            } else {
                reject();
            }

        });

    }

}