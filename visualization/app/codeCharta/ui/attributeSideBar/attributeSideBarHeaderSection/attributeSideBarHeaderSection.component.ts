import "./attributeSideBarHeaderSection.component.scss"
import { Component, Inject, Input } from "@angular/core"

import { Node } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { closeAttributeSideBar } from "../../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"

@Component({
	selector: "cc-attribute-side-bar-header-section",
	template: require("./attributeSideBarHeaderSection.component.html")
})
export class AttributeSideBarHeaderSectionComponent {
	@Input() node: Pick<Node, "isLeaf" | "name" | "link" | "path">
	@Input() fileName: string

	constructor(@Inject(Store) private store: Store) {}

	closeSideBar() {
		this.store.dispatch(closeAttributeSideBar())
	}
}
