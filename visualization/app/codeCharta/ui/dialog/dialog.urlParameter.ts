
export class DialogUrlParameterController {

    constructor(private $mdDialog) {
    }

    public hide() {
        this.$mdDialog.hide();
    }
}

export const dialogUrlParameterComponent = {
    clickOutsideToClose: true,
    template: require("./dialog.urlParameter.html"),
    controller: DialogUrlParameterController,
    controllerAs: "$ctrl"
};