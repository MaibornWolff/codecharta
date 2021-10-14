import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"

import { CodeMapNode } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { rootUnarySelector } from "../../../state/selectors/accumulatedData/rootUnarySelector"

@Component({
	selector: "cc-map-tree-view-item-name",
	template: require("./mapTreeViewItemName.component.html")
})
export class MapTreeViewItemName {
	@Input() node: CodeMapNode
	@Input() isHovered: boolean
	@Input() unaryValue: number
	@Input() unaryPercentage: number

	searchedNodePaths$: Observable<Set<string>>
	rootUnary$: Observable<number>

	constructor(@Inject(Store) store: Store) {
		this.searchedNodePaths$ = store.select(state => state.dynamicSettings.searchedNodePaths)
		this.rootUnary$ = store.select(rootUnarySelector)
	}
}
