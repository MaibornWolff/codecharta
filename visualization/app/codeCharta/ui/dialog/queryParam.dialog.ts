import {SettingsService} from "../../state/settings.service";

export class QueryParamDialogController {

    private _viewModel = {
        queryParams: ""
    }

    constructor(private settingsService: SettingsService, private $mdDialog) {
        this._viewModel.queryParams = this.getSettingsAsUrlParameterString();
    }

    public hide() {
        this.$mdDialog.hide();
    }

    private getSettingsAsUrlParameterString(): string {

        let result = "";

        let iterateProperties = (obj, prefix) => {
            for(let key in obj) {
                if(typeof obj[key] === "object") {
                    iterateProperties(obj[key], prefix + key + ".");
                } else {
                    result += "&" + prefix + key + "=" + obj[key];
                }
            }
        };

        iterateProperties(this.settingsService.getSettings(), "");

        return "?" + result.substring(1).replace(new RegExp("&", "g"),"\n&");
    }

}

export const queryParamDialog = {
    clickOutsideToClose: true,
    title: "Query Parameters",
    template: require("./queryParam.dialog.html"),
    controller: QueryParamDialogController,
    controllerAs: "$ctrl"
};