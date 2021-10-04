import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"

import { CodeMapNode } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"

@Component({
	selector: "cc-map-tree-view-item-name",
	template: require("./mapTreeViewItemName.component.html")
})
export class MapTreeViewItemName {
	@Input() node: CodeMapNode
	@Input() isHovered: boolean
	searchedNodePaths$: Observable<Set<string>>

	constructor(@Inject(Store) store: Store) {
		this.searchedNodePaths$ = store.select(state => state.dynamicSettings.searchedNodePaths)
	}
}
