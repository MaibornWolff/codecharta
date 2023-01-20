import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../angular-redux/store"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { Observable } from "rxjs"
import { CodeMapNode } from "../../../../codeCharta.model"

@Component({
	templateUrl: "./nodeContextMenuCard.component.html",
	styleUrls: ["./nodeContextMenuCard.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class NodeContextMenuCardComponent implements OnInit {
	codeMapNode$: Observable<CodeMapNode>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.codeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)
	}
}
