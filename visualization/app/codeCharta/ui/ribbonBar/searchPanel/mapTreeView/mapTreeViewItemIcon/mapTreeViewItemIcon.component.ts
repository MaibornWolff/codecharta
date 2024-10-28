import { Component, Input } from "@angular/core"
import { CodeMapNode } from "../../../../../codeCharta.model"
import { MapTreeViewItemIconClassPipe } from "./mapTreeViewItemIconClass.pipe"
import { MapTreeViewItemIconColorPipe } from "./mapTreeViewItemIconColor.pipe"

@Component({
    selector: "cc-map-tree-view-item-icon",
    templateUrl: "./mapTreeViewItemIcon.component.html",
    standalone: true,
    imports: [MapTreeViewItemIconClassPipe, MapTreeViewItemIconColorPipe]
})
export class MapTreeViewItemIconComponent {
    @Input() node: CodeMapNode
    @Input() isOpen: boolean
}
