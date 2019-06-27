import "./centerMapButton.component.scss"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

export class CenterMapButtonController {

    /* @ngInject */
    constructor(private threeOrbitControlsService: ThreeOrbitControlsService) {

    }

    public fitMapToView() {
        this.threeOrbitControlsService.autoFitTo()
    }
}

export const centerMapButtonComponent = {
    selector: "centerMapButtonComponent",
    template: require("./centerMapButton.component.html"),
    controller: CenterMapButtonController
}