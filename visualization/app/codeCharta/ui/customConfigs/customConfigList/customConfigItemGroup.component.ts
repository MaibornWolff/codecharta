import { Component, Inject, Input } from "@angular/core"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../customConfigs.component"
import { Store } from "../../../state/angular-redux/store"
import { ThreeOrbitControlsServiceToken } from "../../../services/ajs-upgraded-providers"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControlsService"

@Component({
	selector: "cc-custom-config-item-group",
	template: require("./customConfigItemGroup.component.html")
})
export class CustomConfigItemGroupComponent {
	@Input() customConfigItemGroups: Map<string, CustomConfigItemGroup>
	isExpanded = false

	constructor(
		@Inject(Store) private store: Store,
		@Inject(ThreeCameraService) private threeCameraService: ThreeCameraService,
		@Inject(ThreeOrbitControlsServiceToken) private threeOrbitControlsService: ThreeOrbitControlsService
	) {}

	applyCustomConfig(configId: string) {
		CustomConfigHelper.applyCustomConfig(configId, this.store, this.threeCameraService, this.threeOrbitControlsService)
	}

	removeCustomConfig(configId: string) {
		CustomConfigHelper.deleteCustomConfig(configId)
	}
}
