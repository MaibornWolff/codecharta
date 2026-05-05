import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, CodeMapNode } from "../../../codeCharta.model"
import { addBlacklistItemsIfNotResultsInEmptyMap } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"
import { MatButton } from "@angular/material/button"

@Component({
    selector: "cc-exclude-button",
    templateUrl: "./excludeButton.component.html",
    styleUrls: ["../nodeContextMenuButton.component.scss"],
    imports: [MatButton]
})
export class ExcludeButtonComponent {
    @Input() codeMapNode: Pick<CodeMapNode, "path" | "type">

    constructor(private readonly store: Store<CcState>) {}

    excludeNode() {
        dispatchAfterPaint(
            this.store,
            addBlacklistItemsIfNotResultsInEmptyMap({
                items: [
                    {
                        path: this.codeMapNode.path,
                        type: "exclude",
                        nodeType: this.codeMapNode.type
                    }
                ]
            })
        )
    }
}
