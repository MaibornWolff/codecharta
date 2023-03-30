import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"

import { CodeMapNode, State } from "../../../codeCharta.model"
import { mapTreeViewNodeSelector } from "./mapTreeViewNodeSelector/mapTreeViewNode.selector"

@Component({
	selector: "cc-map-tree-view",
	templateUrl: "./mapTreeView.component.html",
	styleUrls: ["./mapTreeView.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class MapTreeViewComponent {
	mapTreeViewNode$: Observable<CodeMapNode>

	constructor(store: Store<State>) {
		this.mapTreeViewNode$ = store.select(mapTreeViewNodeSelector)
	}
}
