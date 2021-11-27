import "./attributeSideBarHeaderSection.component.scss"
import { Component, Input } from "@angular/core"

import { Node } from "../../../codeCharta.model"
import { LazyLoader } from "../../../util/lazyLoader"

@Component({
	selector: "cc-attribute-side-bar-header-section",
	template: require("./attributeSideBarHeaderSection.component.html")
})
export class AttributeSideBarHeaderSectionComponent {
	@Input() node: Node
	@Input() fileName: string
	@Input() closeSideBar: () => void

	handleClickNodeName() {
		if (!this.node.isLeaf) return
		LazyLoader.openFile(this.fileName, this.node.path)
	}
}
