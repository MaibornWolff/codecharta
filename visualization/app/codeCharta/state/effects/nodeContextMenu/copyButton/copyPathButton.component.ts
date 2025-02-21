import { Component, Input } from "@angular/core"

import { CodeMapNode } from "../../../../codeCharta.model"
import { MatButton } from "@angular/material/button"
import { LastPartOfNodePathPipe } from "../nodeContextMenuCard/lastPartOfNodePath.pipe"

@Component({
    selector: "cc-copy-button",
    templateUrl: "./copyPathButton.component.html",
    styleUrls: ["../nodeContextMenuButton.component.scss"],
    standalone: true,
    imports: [MatButton, LastPartOfNodePathPipe]
})
export class CopyPathButtonComponent {
    @Input() codeMapNode: Pick<CodeMapNode, "path">

    constructor() {}

    async copyToClipboard(path: string) {
        await navigator.clipboard.writeText(path)
    }
}
