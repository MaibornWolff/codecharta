import { Component, Input, ViewEncapsulation } from "@angular/core"
import { CustomConfigItem } from "../../../customConfigs.component"
import { CustomConfigHelper } from "../../../../../util/customConfigHelper"
import { ThreeCameraService } from "../../../../codeMap/threeViewer/threeCamera.service"
import { ThreeMapControlsService } from "../../../../codeMap/threeViewer/threeMapControls.service"
import { Store } from "@ngrx/store"

@Component({
    selector: "cc-apply-custom-config-button",
    templateUrl: "./applyCustomConfigButton.component.html",
    styleUrls: ["./applyCustomConfigButton.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class ApplyCustomConfigButtonComponent {
    @Input() customConfigItem: CustomConfigItem

    constructor(
        private store: Store,
        private threeCameraService: ThreeCameraService,
        private threeOrbitControlsService: ThreeMapControlsService
    ) {}

    applyCustomConfig() {
        CustomConfigHelper.applyCustomConfig(this.customConfigItem.id, this.store, this.threeCameraService, this.threeOrbitControlsService)
    }
}
