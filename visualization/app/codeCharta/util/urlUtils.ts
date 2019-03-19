"use strict";
import {ILocationService, IHttpService, IHttpResponse} from "angular";

export interface NameDataPair {
    fileName: string;
    content: Object;
}

export class UrlUtils {

    private static OK_CODE = 200;

    constructor(private $location: ILocationService, private $http: IHttpService) {
    }

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

    public getUrl(): string {
        return this.$location.absUrl();
    }

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

    public getFileDataFromFile(file: string): Promise<NameDataPair> {

        return new Promise((resolve, reject) => {

            if (file && file.length > 0) {
                this.$http.get(file).then(
                    (response: IHttpResponse<Object>) => {
                        if (response.status === UrlUtils.OK_CODE) {
                            Object.assign(response.data, {fileName: file});
                            resolve({fileName: file, content: response.data});
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