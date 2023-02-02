import { Component, ViewEncapsulation } from "@angular/core"
import { CustomConfigHelperService } from "../customConfigHelper.service"

@Component({
	templateUrl: "./customConfigList.component.html",
	styleUrls: ["./customConfigList.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class CustomConfigListComponent {
	isCollapsed = true

	constructor(public customConfigService: CustomConfigHelperService) {}

	toggleNonApplicableCustomConfigsList() {
		this.isCollapsed = !this.isCollapsed
	}
}
