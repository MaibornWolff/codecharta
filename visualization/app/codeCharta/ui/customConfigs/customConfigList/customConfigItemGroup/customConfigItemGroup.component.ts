import { Component, Input, ViewEncapsulation } from "@angular/core"
import { CustomConfigHelper } from "../../../../util/customConfigHelper"
import { CustomConfigItemGroup } from "../../customConfigs.component"

@Component({
	selector: "cc-custom-config-item-group",
	templateUrl: "./customConfigItemGroup.component.html",
	styleUrls: ["./customConfigItemGroup.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class CustomConfigItemGroupComponent {
	@Input() customConfigItemGroups: Map<string, CustomConfigItemGroup>
	isExpanded = false

	removeCustomConfig(configId: string) {
		CustomConfigHelper.deleteCustomConfig(configId)
	}
}
