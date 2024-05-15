import { Component, ViewEncapsulation } from "@angular/core"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"

@Component({
    selector: "cc-center-map-button",
    templateUrl: "./centerMapButton.component.html",
    styleUrls: ["./centerMapButton.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class CenterMapButtonComponent {
    constructor(private threeOrbitControlsService: ThreeOrbitControlsService) {}

    centerMap() {
        this.threeOrbitControlsService.autoFitTo()
    }
}
