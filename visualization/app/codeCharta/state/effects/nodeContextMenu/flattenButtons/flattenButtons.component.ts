import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { CodeMapNode } from "../../../../codeCharta.model"
import { addBlacklistItem, removeBlacklistItem } from "../../../store/fileSettings/blacklist/blacklist.actions"
import { MatButton } from "@angular/material/button"

@Component({
    selector: "cc-flatten-buttons",
    templateUrl: "./flattenButtons.component.html",
    styleUrls: ["../nodeContextMenuButton.component.scss"],
    standalone: true,
    imports: [MatButton]
})
export class FlattenButtonsComponent {
    @Input() codeMapNode: Pick<CodeMapNode, "path" | "type" | "isFlattened">

    constructor(private readonly store: Store) {}

    flattenNode() {
        this.store.dispatch(
            addBlacklistItem({
                item: {
                    path: this.codeMapNode.path,
                    type: "flatten",
                    nodeType: this.codeMapNode.type
                }
            })
        )
    }

    unFlattenNode() {
        this.store.dispatch(
            removeBlacklistItem({
                item: {
                    path: this.codeMapNode.path,
                    type: "flatten",
                    nodeType: this.codeMapNode.type
                }
            })
        )
    }
}
