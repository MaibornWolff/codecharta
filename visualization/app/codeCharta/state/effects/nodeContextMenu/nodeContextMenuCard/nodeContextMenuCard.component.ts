import { Component, OnInit } from "@angular/core"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { Observable } from "rxjs"
import { CcState, CodeMapNode } from "../../../../codeCharta.model"
import { Store } from "@ngrx/store"
import { MatCard } from "@angular/material/card"
import { MarkFolderRowComponent } from "../markFolderRow/markFolderRow.component"
import { MatDivider } from "@angular/material/divider"
import { FocusButtonsComponent } from "../focusButtons/focusButtons.component"
import { FlattenButtonsComponent } from "../flattenButtons/flattenButtons.component"
import { HighlightButtonsComponent } from "../highlightButtons/highlightButtons.component"
import { ExcludeButtonComponent } from "../excludeButton/excludeButton.component"
import { AsyncPipe } from "@angular/common"
import { CopyPathButtonComponent } from "../copyButton/copyPathButton.component"

@Component({
    selector: "cc-node-context-menu-card",
    templateUrl: "./nodeContextMenuCard.component.html",
    styleUrls: ["./nodeContextMenuCard.component.scss"],
    standalone: true,
    imports: [
        MatCard,
        MarkFolderRowComponent,
        MatDivider,
        FocusButtonsComponent,
        FlattenButtonsComponent,
        HighlightButtonsComponent,
        ExcludeButtonComponent,
        CopyPathButtonComponent,
        AsyncPipe
    ]
})
export class NodeContextMenuCardComponent implements OnInit {
    codeMapNode$: Observable<CodeMapNode>

    constructor(private readonly store: Store<CcState>) {}

    ngOnInit(): void {
        this.codeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)
    }
}
