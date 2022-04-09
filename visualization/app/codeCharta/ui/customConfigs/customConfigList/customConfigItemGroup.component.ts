import { Component, Input } from "@angular/core"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../customConfigs.component"

@Component({
	selector: "cc-custom-config-item-group",
	template: require("./customConfigItemGroup.component.html")
})
export class CustomConfigItemGroupComponent {
	@Input() customConfigItemGroups: Map<string, CustomConfigItemGroup>
	@Input() isApplicable: boolean
	isCollapsed = false

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	applyCustomConfig(configId: string) {
		//CustomConfigHelper.applyCustomConfig(configId, this.storeService, this.threeCameraService, this.threeOrbitControlsService)
	}

	removeCustomConfig(configId: string) {
		CustomConfigHelper.deleteCustomConfig(configId)
	}
}
