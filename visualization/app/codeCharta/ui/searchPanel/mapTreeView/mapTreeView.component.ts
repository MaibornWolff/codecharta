import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"

import { CodeMapNode } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { mapTreeViewNodeSelector } from "./mapTreeViewNodeSelector/mapTreeViewNode.selector"

@Component({
	selector: "cc-map-tree-view",
	templateUrl: "./mapTreeView.component.html",
	styleUrls: ["./mapTreeView.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class MapTreeViewComponent {
	mapTreeViewNode$: Observable<CodeMapNode>

	constructor(@Inject(Store) store: Store) {
		this.mapTreeViewNode$ = store.select(mapTreeViewNodeSelector)
	}
}
