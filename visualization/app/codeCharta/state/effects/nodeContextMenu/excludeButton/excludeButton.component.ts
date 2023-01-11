import { Component, Inject, Input } from "@angular/core"
import { CodeMapNode } from "../../../../codeCharta.model"
import { Store } from "../../../angular-redux/store"
import { addBlacklistItemsIfNotResultsInEmptyMap } from "../../../store/fileSettings/blacklist/blacklist.actions"

@Component({
	selector: "cc-exclude-button",
	template: require("./excludeButton.component.html")
})
export class ExcludeButtonComponent {
	@Input() codeMapNode: Pick<CodeMapNode, "path" | "type">

	constructor(@Inject(Store) private store: Store) {}

	excludeNode() {
		this.store.dispatch(
			addBlacklistItemsIfNotResultsInEmptyMap([
				{
					path: this.codeMapNode.path,
					type: "exclude",
					nodeType: this.codeMapNode.type
				}
			])
		)
	}
}
