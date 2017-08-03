"use strict";

/**
 * This service offers an application specific url API.
 */
class UrlService {

    /* @ngInject */

    /**
     * @external {$location} https://docs.angularjs.org/api/ng/service/$location
     * @param {$location} $location
     * @param {$http} $http
     */
    constructor($location, $http) {

        /** @type {$location} */
        this.location = $location;

        /** @type {$http} */
        this.http = $http;

    }

    /**
     * returns an url parameter value by its key.
     * @param {string} key
     * @returns {string} url parameter value
     */
    getParam(key) {
        return this.getParameterByName(key);
    }

    /**
     * returns an url parameter value by its name/key.
     * @param {string} name
     * @param {string} [url=current location]
     * @returns {string} url parameter value
     */
    getParameterByName(name, url) {
        if (!url) {
            url = this.getUrl();
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
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
    getUrl() {
        return this.location.absUrl();
    }

    /**
     * returns the files content specified in the 'file' url parameter
     * @returns {Promise} which returns the files content on resolution
     */
    getFileDataFromQueryParam() {

        return new Promise((resolve, reject) => {
            var param = this.getParam("file");
            this.getFileDataFromFile(param).then(resolve, reject);
        });

    }

    /**
     * returns the files content specified in the 'file' parameter
     * @returns {Promise} which returns the files content on resolution
     */
    getFileDataFromFile(file) {

        return new Promise((resolve, reject) => {

            if(file && file.length > 0) {
                this.http.get(file).then(
                    function (response) {
                        if (response.status === 200) {
                            resolve(response.data);
                        } else {
                            reject();
                        }
                    },function () {
                        reject();
                    }
                );
            } else {
                reject();
            }

        });

    }

}

export {UrlService};