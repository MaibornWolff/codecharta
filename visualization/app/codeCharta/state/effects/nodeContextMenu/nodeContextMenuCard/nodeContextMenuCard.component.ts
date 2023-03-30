import { Component, OnInit, ViewEncapsulation } from "@angular/core"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { Observable } from "rxjs"
import { CodeMapNode, State } from "../../../../codeCharta.model"
import { Store } from "@ngrx/store"

@Component({
	templateUrl: "./nodeContextMenuCard.component.html",
	styleUrls: ["./nodeContextMenuCard.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class NodeContextMenuCardComponent implements OnInit {
	codeMapNode$: Observable<CodeMapNode>

	constructor(private store: Store<State>) {}

	ngOnInit(): void {
		this.codeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)
	}
}
