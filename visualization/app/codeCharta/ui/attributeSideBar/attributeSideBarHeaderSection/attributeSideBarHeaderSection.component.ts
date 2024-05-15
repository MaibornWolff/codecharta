import { Component, Input, ViewEncapsulation } from "@angular/core"

import { CodeMapNode } from "../../../codeCharta.model"
import { IsAttributeSideBarVisibleService } from "../../../services/isAttributeSideBarVisible.service"

@Component({
    selector: "cc-attribute-side-bar-header-section",
    templateUrl: "./attributeSideBarHeaderSection.component.html",
    styleUrls: ["./attributeSideBarHeaderSection.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class AttributeSideBarHeaderSectionComponent {
    @Input() node: Pick<CodeMapNode, "children" | "name" | "link" | "path">
    @Input() fileName: string

    constructor(private isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService) {}

    closeSideBar() {
        this.isAttributeSideBarVisibleService.isOpen = false
    }
}
