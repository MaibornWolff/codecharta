import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { CodeMapNode } from "../../../../codeCharta.model"
import { addBlacklistItemsIfNotResultsInEmptyMap } from "../../../store/fileSettings/blacklist/blacklist.actions"
import { MatButton } from "@angular/material/button"

@Component({
    selector: "cc-exclude-button",
    templateUrl: "./excludeButton.component.html",
    styleUrls: ["../nodeContextMenuButton.component.scss"],
    standalone: true,
    imports: [MatButton]
})
export class ExcludeButtonComponent {
    @Input() codeMapNode: Pick<CodeMapNode, "path" | "type">

    constructor(private readonly store: Store) {}

    excludeNode() {
        this.store.dispatch(
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
