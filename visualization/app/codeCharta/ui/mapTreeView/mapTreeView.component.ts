import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"

import { CodeMapNode } from "../../codeCharta.model"
import { Store } from "../../state/angular-redux/store"
import { mapTreeViewNodeSelector } from "./mapTreeViewNodeSelector/mapTreeViewNode.selector"

import "./mapTreeView.component.scss"

@Component({
	selector: "cc-map-tree-view",
	template: require("./mapTreeView.component.html")
})
export class MapTreeViewComponent {
	mapTreeViewNode$: Observable<CodeMapNode>

	constructor(@Inject(Store) store: Store) {
		this.mapTreeViewNode$ = store.select(mapTreeViewNodeSelector)
	}
}
