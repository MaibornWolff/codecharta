import { Component, Input, ViewEncapsulation } from "@angular/core"

@Component({
	selector: "cc-map-tree-view-item-option-buttons",
	templateUrl: "./mapTreeViewItemOptionButtons.component.html",
	encapsulation: ViewEncapsulation.None
})
export class MapTreeViewItemOptionButtonsComponent {
	@Input() isFlattened: boolean
	@Input() openNodeContextMenu: (event: MouseEvent) => unknown
}
