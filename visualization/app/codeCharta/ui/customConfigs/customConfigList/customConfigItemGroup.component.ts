import { Component, Input } from "@angular/core"
import { CustomConfigItemGroup } from "../customConfigs.component"

@Component({
	selector: "cc-custom-config-item-group",
	template: require("./customConfigItemGroup.component.html")
})
export class CustomConfigItemGroupComponent {
	@Input() customConfigItemGroup: CustomConfigItemGroup
	isCollapsed = false

	toggleSubList() {
		this.isCollapsed = this.isCollapsed !== true
	}
}
