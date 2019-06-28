import "./floatingPanel.component.scss"

export class FloatingPanelController {

    /* @ngInject */
    constructor() {

    }

}

export const floatingPanelComponent = {
    selector: "floatingPanelComponent",
    template: require("./floatingPanel.component.html"),
    controller: FloatingPanelController
}