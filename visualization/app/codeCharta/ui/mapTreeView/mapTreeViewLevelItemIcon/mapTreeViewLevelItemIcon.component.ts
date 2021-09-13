import { Component, Input } from "@angular/core"
import { CodeMapNode } from "../../../codeCharta.model"

@Component({
	selector: "cc-map-tree-view-level-item-icon",
	template: require("./mapTreeViewLevelItemIcon.component.html")
})
export class MapTreeViewLevelItemIcon {
	@Input() node: CodeMapNode
	@Input() isFolderOpen: boolean
}
