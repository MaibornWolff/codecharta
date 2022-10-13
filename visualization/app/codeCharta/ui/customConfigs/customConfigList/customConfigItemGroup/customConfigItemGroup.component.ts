import { Component, Inject, Input } from "@angular/core"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../../customConfigs.component"
import { Store } from "../../../../state/angular-redux/store"
import { ThreeCameraService } from "../../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../../codeMap/threeViewer/threeOrbitControls.service"
import { IsCustomConfigApplicableService } from "./isCustomConfigApplicable.service"

@Component({
	selector: "cc-custom-config-item-group",
	template: require("./customConfigItemGroup.component.html")
})
export class CustomConfigItemGroupComponent {
	@Input() customConfigItemGroups: Map<string, CustomConfigItemGroup>
	isExpanded = false

	constructor(
		@Inject(Store) private store: Store,
		@Inject(IsCustomConfigApplicableService) public isCustomConfigApplicableService: IsCustomConfigApplicableService,
		@Inject(ThreeCameraService) private threeCameraService: ThreeCameraService,
		@Inject(ThreeOrbitControlsService) private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	applyCustomConfig(configId: string) {
		CustomConfigHelper.applyCustomConfig(configId, this.store, this.threeCameraService, this.threeOrbitControlsService)
	}

	removeCustomConfig(configId: string) {
		CustomConfigHelper.deleteCustomConfig(configId)
	}
}
