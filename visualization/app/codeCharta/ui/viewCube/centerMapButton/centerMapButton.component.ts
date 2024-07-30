import { Component, ViewEncapsulation } from "@angular/core"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"

@Component({
    selector: "cc-center-map-button",
    templateUrl: "./centerMapButton.component.html",
    styleUrls: ["./centerMapButton.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class CenterMapButtonComponent {
    constructor(
        private threeOrbitControlsService: ThreeOrbitControlsService,
        private threeCameraService: ThreeCameraService
    ) {}

    centerMap() {
        this.threeOrbitControlsService.autoFitTo()
        this.threeCameraService.setZoomFactor(1)
    }
}
