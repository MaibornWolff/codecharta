import angular, {IAngularEvent} from "angular";
import {queryParamDialog} from "./queryParam.dialog";

export class DialogService {

    public static SELECTOR = "dialogService";

    /* @ngInject */
    constructor(private $rootScope, private $mdDialog) {
    }

    showQueryParamDialog() {
        this.showCustomDialog(queryParamDialog);
    }

    showCustomDialog(dialog) {
        this.$mdDialog.show(
            dialog
        );
    }

    showErrorDialog(
        msg: string = "An error occured.",
        title: string = "Error",
        button: string = "Ok",
    ) {
        this.$mdDialog.show(
            this.$mdDialog.alert()
                .clickOutsideToClose(true)
                .title(title)
                .textContent(msg)
                .ok(button)
        );
    }

    showPromptDialog(
        msg: string,
        initial: string,
        placeholder: string = initial,
        title: string = "Prompt",
        button: string = "Ok",
    ): Promise<any> {

        let prompt = this.$mdDialog.prompt()
            .title(title)
            .textContent(msg)
            .initialValue(initial)
            .placeholder(placeholder)
            .ok(button);

        return this.$mdDialog.show(prompt);

    }

}