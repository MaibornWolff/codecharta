import "./nodeContextMenuCard.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"

@Component({
	selector: "cc-node-context-menu-card",
	template: require("./nodeContextMenuCard.component.html")
})
export class NodeContextMenuCardComponent {
	codeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)

	constructor(@Inject(Store) private store: Store) {}

	excludeNode() {
		// console.log("excludeNode")
		// this.store.dispatch(
		// 	addBlacklistItemsIfNotResultsInEmptyMap([
		// 		{
		// 			path: this.codeMapNode.path,
		// 			type: BlacklistType.exclude,
		// 			nodeType: this.codeMapNode.type
		// 		}
		// 	])
		// )
	}
}
