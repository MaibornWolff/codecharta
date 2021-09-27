import { Component, Input } from "@angular/core"
import { CodeMapNode } from "../../../codeCharta.model"

@Component({
	selector: "cc-map-tree-view-item-icon",
	template: require("./mapTreeViewItemIcon.component.html")
})
export class MapTreeViewItemIcon {
	@Input() node: CodeMapNode
	@Input() isFolderOpen: boolean
}
