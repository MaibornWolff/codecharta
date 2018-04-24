import {SettingsService} from "../../core/settings/settings.service";

export class QueryParamDialogController {

    private queryParams: string;

    constructor(private settingsService: SettingsService, private $mdDialog) {
        this.queryParams = settingsService.getQueryParamString().replace(new RegExp("&", "g"),"\n&");
    }

    hide() {
        this.$mdDialog.hide();
    }

}

export const queryParamDialog = {
    clickOutsideToClose: true,
    title: "HELLO",
    template: require("./queryParam.dialog.html"),
    controller: QueryParamDialogController,
    controllerAs: "$ctrl"
};