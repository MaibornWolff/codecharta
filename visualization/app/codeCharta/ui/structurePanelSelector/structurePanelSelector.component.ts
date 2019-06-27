import "./structurePanelSelector.component.scss"

export class StructurePanelSelectorController {

    /* @ngInject */
    constructor() {

    }

}

export const structurePanelSelectorComponent = {
    selector: "structurePanelSelectorComponent",
    template: require("./structurePanelSelector.component.html"),
    controller: StructurePanelSelectorController
}