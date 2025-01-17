import { Component, Input } from "@angular/core"

import { CodeMapNode } from "../../../codeCharta.model"
import { IsAttributeSideBarVisibleService } from "../../../services/isAttributeSideBarVisible.service"
import { MatTooltip } from "@angular/material/tooltip"
import { NodePathComponent } from "./nodePath/nodePath.component"
import { RemoveExtensionPipe } from "../../../util/pipes/removeExtension.pipe"

@Component({
    selector: "cc-attribute-side-bar-header-section",
    templateUrl: "./attributeSideBarHeaderSection.component.html",
    styleUrls: ["./attributeSideBarHeaderSection.component.scss"],
    standalone: true,
    imports: [MatTooltip, NodePathComponent, RemoveExtensionPipe]
})
export class AttributeSideBarHeaderSectionComponent {
    @Input() node: Pick<CodeMapNode, "children" | "name" | "link" | "path">
    @Input() fileName: string

    constructor(private readonly isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService) {}

    closeSideBar() {
        this.isAttributeSideBarVisibleService.isOpen = false
    }
}
