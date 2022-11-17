import { Component, Input } from "@angular/core"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../../customConfigs.component"

@Component({
	selector: "cc-custom-config-item-group",
	template: require("./customConfigItemGroup.component.html")
})
export class CustomConfigItemGroupComponent {
	@Input() customConfigItemGroups: Map<string, CustomConfigItemGroup>
	isExpanded = false

	removeCustomConfig(configId: string) {
		CustomConfigHelper.deleteCustomConfig(configId)
	}
}
