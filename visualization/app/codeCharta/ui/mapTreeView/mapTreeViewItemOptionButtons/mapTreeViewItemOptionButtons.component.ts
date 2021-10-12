import { Component, Input } from "@angular/core"

@Component({
	selector: "cc-map-tree-view-item-option-buttons",
	template: require("./mapTreeViewItemOptionButtons.component.html")
})
export class MapTreeViewItemOptionButtons {
	@Input() isFlattened: boolean
	@Input() openNodeContextMenu: (event: MouseEvent) => unknown
}
