import {SettingsService} from "../../core/settings/settings.service";

export class QueryParamDialogController {

    private _queryParams: string;

    constructor(settingsService: SettingsService, private $mdDialog) {
        this._queryParams = settingsService.getQueryParamString().replace(new RegExp("&", "g"),"\n&");
    }

    public hide() {
        this.$mdDialog.hide();
    }

}

export const queryParamDialog = {
    clickOutsideToClose: true,
    title: "Query Parameters",
    template: require("./queryParam.dialog.html"),
    controller: QueryParamDialogController,
    controllerAs: "$ctrl"
};