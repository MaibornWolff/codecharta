import "./nodeContextMenuCard.component.scss"
import { Component, Inject, OnInit } from "@angular/core"
import { Store } from "../../../angular-redux/store"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { Observable } from "rxjs"
import { CodeMapNode } from "../../../../codeCharta.model"

@Component({
	selector: "cc-node-context-menu-card",
	template: require("./nodeContextMenuCard.component.html")
})
export class NodeContextMenuCardComponent implements OnInit {
	codeMapNode$: Observable<CodeMapNode>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.codeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)
	}
}
