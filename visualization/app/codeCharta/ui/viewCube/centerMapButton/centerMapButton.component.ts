import { Component, ViewEncapsulation } from "@angular/core"
import { ThreeMapControlsService } from "../../codeMap/threeViewer/threeMapControls.service"

@Component({
    selector: "cc-center-map-button",
    templateUrl: "./centerMapButton.component.html",
    styleUrls: ["./centerMapButton.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class CenterMapButtonComponent {
    constructor(private threeOrbitControlsService: ThreeMapControlsService) {}

    centerMap() {
        this.threeOrbitControlsService.autoFitTo()
    }
}
