import "./attributeSideBarHeaderSection.component.scss"
import { Component, Inject, Input } from "@angular/core"

import { CodeMapNode } from "../../../codeCharta.model"
import { LazyLoader } from "../../../util/lazyLoader"
import { Store } from "../../../state/angular-redux/store"
import { closeAttributeSideBar } from "../../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { isLeaf } from "../../../util/codeMapHelper"

@Component({
	selector: "cc-attribute-side-bar-header-section",
	template: require("./attributeSideBarHeaderSection.component.html")
})
export class AttributeSideBarHeaderSectionComponent {
	@Input() node: Pick<CodeMapNode, "children" | "name" | "link" | "path">
	@Input() fileName: string

	constructor(@Inject(Store) private store: Store) {}

	handleClickNodeName() {
		if (!isLeaf(this.node)) return
		LazyLoader.openFile(this.fileName, this.node.path)
	}

	closeSideBar() {
		this.store.dispatch(closeAttributeSideBar())
	}
}
