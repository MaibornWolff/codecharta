import { Component, Input } from "@angular/core"

@Component({
    selector: "cc-map-tree-view-item-option-buttons",
    templateUrl: "./mapTreeViewItemOptionButtons.component.html",
    styleUrls: ["./mapTreeViewItemOptionButtons.component.scss"]
})
export class MapTreeViewItemOptionButtonsComponent {
    @Input() isFlattened: boolean
    @Input() openNodeContextMenu: (event: MouseEvent) => unknown
}
