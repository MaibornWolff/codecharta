import { Component, Input, ViewEncapsulation } from "@angular/core"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../../customConfigs.component"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import { Store } from "@ngrx/store"

@Component({
	selector: "cc-custom-config-item-group",
	templateUrl: "./customConfigItemGroup.component.html",
	styleUrls: ["./customConfigItemGroup.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class CustomConfigItemGroupComponent {
	@Input() customConfigItemGroups: Map<string, CustomConfigItemGroup>
	isExpanded = false

	constructor(
		private store: Store,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	removeCustomConfig(configId: string) {
		CustomConfigHelper.deleteCustomConfig(configId)
	}

	applyCustomConfig(configId: string) {
		CustomConfigHelper.applyCustomConfig(configId, this.store, this.threeCameraService, this.threeOrbitControlsService)
	}
}
