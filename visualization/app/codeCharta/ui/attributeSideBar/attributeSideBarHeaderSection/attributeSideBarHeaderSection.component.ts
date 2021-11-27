import "./attributeSideBarHeaderSection.component.scss"
import { Component, Inject, Input } from "@angular/core"

import { Node } from "../../../codeCharta.model"
import { LazyLoader } from "../../../util/lazyLoader"
import { Store } from "../../../state/angular-redux/store"
import { closeAttributeSideBar } from "../../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"

@Component({
	selector: "cc-attribute-side-bar-header-section",
	template: require("./attributeSideBarHeaderSection.component.html")
})
export class AttributeSideBarHeaderSectionComponent {
	@Input() node: Node
	@Input() fileName: string

	constructor(@Inject(Store) private store: Store) {}

	handleClickNodeName() {
		if (!this.node.isLeaf) return
		LazyLoader.openFile(this.fileName, this.node.path)
	}

	closeSideBar() {
		this.store.dispatch(closeAttributeSideBar())
	}
}
