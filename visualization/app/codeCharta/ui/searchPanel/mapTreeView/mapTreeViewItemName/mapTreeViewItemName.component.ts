import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"

import { CodeMapNode } from "../../../../codeCharta.model"
import { Store } from "../../../../state/angular-redux/store"
import { rootUnarySelector } from "../../../../state/selectors/accumulatedData/rootUnary.selector"
import { searchedNodePathsSelector } from "../../../../state/selectors/searchedNodes/searchedNodePaths.selector"

@Component({
	selector: "cc-map-tree-view-item-name",
	template: require("./mapTreeViewItemName.component.html")
})
export class MapTreeViewItemNameComponent {
	@Input() node: CodeMapNode
	@Input() isHovered: boolean
	@Input() unaryValue: number
	@Input() unaryPercentage: number

	searchedNodePaths$: Observable<Set<string>>
	rootUnary$: Observable<number>

	constructor(@Inject(Store) store: Store) {
		this.searchedNodePaths$ = store.select(searchedNodePathsSelector)
		this.rootUnary$ = store.select(rootUnarySelector)
	}
}
