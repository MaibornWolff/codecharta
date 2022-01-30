import { Component, Inject, Input } from "@angular/core"
import { BlacklistType, CodeMapNode } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { addBlacklistItemsIfNotResultsInEmptyMap } from "../../../state/store/fileSettings/blacklist/blacklist.actions"

@Component({
	selector: "cc-node-context-menu-card",
	template: require("./nodeContextMenuCard.component.html")
})
export class NodeContextMenuCardComponent {
	@Input() codeMapNode: CodeMapNode

	constructor(@Inject(Store) private store: Store) {}

	excludeNode() {
		this.store.dispatch(
			addBlacklistItemsIfNotResultsInEmptyMap([
				{
					path: this.codeMapNode.path,
					type: BlacklistType.exclude,
					nodeType: this.codeMapNode.type
				}
			])
		)
	}
}
