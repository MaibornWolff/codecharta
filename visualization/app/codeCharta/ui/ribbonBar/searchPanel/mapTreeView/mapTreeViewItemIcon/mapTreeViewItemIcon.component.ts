import { Component, Input } from "@angular/core"
import { CodeMapNode } from "../../../../../codeCharta.model"

@Component({
    selector: "cc-map-tree-view-item-icon",
    templateUrl: "./mapTreeViewItemIcon.component.html"
})
export class MapTreeViewItemIconComponent {
    @Input() node: CodeMapNode
    @Input() isOpen: boolean
}
