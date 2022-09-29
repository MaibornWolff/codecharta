import "./attributeSideBarHeaderSection.component.scss"
import { Component, Input, Inject } from "@angular/core"

import { CodeMapNode } from "../../../codeCharta.model"
import { IsAttributeSideBarVisibleService } from "../../../services/isAttributeSideBarVisible.service"

@Component({
	selector: "cc-attribute-side-bar-header-section",
	template: require("./attributeSideBarHeaderSection.component.html")
})
export class AttributeSideBarHeaderSectionComponent {
	@Input() node: Pick<CodeMapNode, "children" | "name" | "link" | "path">
	@Input() fileName: string

	constructor(@Inject(IsAttributeSideBarVisibleService) private isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService) {}

	closeSideBar() {
		this.isAttributeSideBarVisibleService.isOpen = false
	}
}
