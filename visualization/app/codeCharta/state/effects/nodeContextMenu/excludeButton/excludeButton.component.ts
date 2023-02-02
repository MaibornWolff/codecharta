import { Component, Input, ViewEncapsulation } from "@angular/core"
import { CodeMapNode } from "../../../../codeCharta.model"
import { Store } from "../../../angular-redux/store"
import { addBlacklistItemsIfNotResultsInEmptyMap } from "../../../store/fileSettings/blacklist/blacklist.actions"

@Component({
	selector: "cc-exclude-button",
	templateUrl: "./excludeButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class ExcludeButtonComponent {
	@Input() codeMapNode: Pick<CodeMapNode, "path" | "type">

	constructor(private store: Store) {}

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
