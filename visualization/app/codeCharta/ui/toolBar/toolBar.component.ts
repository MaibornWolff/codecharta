import "./toolBar.component.scss"

export class ToolBarController {

    /* @ngInject */
    constructor() {

    }

}

export const toolBarComponent = {
    selector: "toolBarComponent",
    template: require("./toolBar.component.html"),
    controller: ToolBarController
}