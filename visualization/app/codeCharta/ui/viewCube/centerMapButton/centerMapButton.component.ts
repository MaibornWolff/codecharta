import { Component, ViewEncapsulation } from "@angular/core"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import { Store } from "@ngrx/store"
import { setCameraZoomFactor } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.actions"
import { CcState } from "../../../codeCharta.model"

@Component({
    selector: "cc-center-map-button",
    templateUrl: "./centerMapButton.component.html",
    styleUrls: ["./centerMapButton.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class CenterMapButtonComponent {
    constructor(
        private threeOrbitControlsService: ThreeOrbitControlsService,
        private store: Store<CcState>
    ) {}

    centerMap() {
        this.threeOrbitControlsService.autoFitTo()
        this.store.dispatch(setCameraZoomFactor({ value: 1 }))
    }
}
