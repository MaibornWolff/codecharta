import "./customConfigList.component.scss"
import { Component, Inject } from "@angular/core"
import { CustomConfigHelperService } from "../customConfigHelper.service"
import { CustomConfigGroups } from "./getCustomConfigItemGroups"

@Component({
	template: require("./customConfigList.component.html")
})
export class CustomConfigListComponent {
	dropDownCustomConfigItemGroups: CustomConfigGroups
	isCollapsed = true

	constructor(@Inject(CustomConfigHelperService) public customConfigService: CustomConfigHelperService) {}

	toggleNonApplicableCustomConfigsList() {
		this.isCollapsed = !this.isCollapsed
	}
}
