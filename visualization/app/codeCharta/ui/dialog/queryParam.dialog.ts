import {SettingsService} from "../../core/settings/settings.service";

export class QueryParamDialogController {

    private _viewModel = {
        queryParams: ""
    }

    constructor(private settingsService: SettingsService, private $mdDialog) {
        this._viewModel.queryParams = this.getQueryParamString().replace(new RegExp("&", "g"),"\n&");
    }

    public hide() {
        this.$mdDialog.hide();
    }

    private getQueryParamString() {

        let result = "";

        let iterateProperties = (obj, prefix) => {
            for (let i in obj) {
                if (obj.hasOwnProperty(i) && i !== "map" && i) {

                    if (typeof obj[i] === "string" || obj[i] instanceof String) {
                        //do not iterate over strings
                    } else {
                        iterateProperties(obj[i], i + ".");
                    }

                    if (typeof obj[i] === "object" || obj[i] instanceof Object) {
                        //do not print objects in string
                    } else {
                        result += "&" + prefix + i + "=" + obj[i];
                    }

                }

            }

        };

        iterateProperties(this.settingsService.getSettings(), "");

        return "?" + result.substring(1);

    }

}

export const queryParamDialog = {
    clickOutsideToClose: true,
    title: "Query Parameters",
    template: require("./queryParam.dialog.html"),
    controller: QueryParamDialogController,
    controllerAs: "$ctrl"
};