import { Component, OnInit } from "@angular/core"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { Observable } from "rxjs"
import { CodeMapNode, CcState } from "../../../../codeCharta.model"
import { Store } from "@ngrx/store"

@Component({
    templateUrl: "./nodeContextMenuCard.component.html",
    styleUrls: ["./nodeContextMenuCard.component.scss"]
})
export class NodeContextMenuCardComponent implements OnInit {
    codeMapNode$: Observable<CodeMapNode>

    constructor(private store: Store<CcState>) {}

    ngOnInit(): void {
        this.codeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)
    }
}
