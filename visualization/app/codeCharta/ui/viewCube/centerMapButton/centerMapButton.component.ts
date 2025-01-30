import { Component } from "@angular/core"
import { ThreeMapControlsService } from "../../codeMap/threeViewer/threeMapControls.service"

@Component({
    selector: "cc-center-map-button",
    templateUrl: "./centerMapButton.component.html",
    styleUrls: ["./centerMapButton.component.scss"],
    standalone: true
})
export class CenterMapButtonComponent {
    constructor(private readonly threeMapControlsService: ThreeMapControlsService) {}

    centerMap() {
        this.threeMapControlsService.autoFitTo()
    }
}
