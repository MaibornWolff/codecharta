import { Component, Input, ViewEncapsulation } from "@angular/core"
import { CustomConfigItem } from "../../../customConfigs.component"
import { CustomConfigHelper } from "../../../../../util/customConfigHelper"
import { Store } from "../../../../../state/angular-redux/store"
import { ThreeCameraService } from "../../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../../codeMap/threeViewer/threeOrbitControls.service"

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
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	applyCustomConfig() {
		CustomConfigHelper.applyCustomConfig(this.customConfigItem.id, this.store, this.threeCameraService, this.threeOrbitControlsService)
	}
}
