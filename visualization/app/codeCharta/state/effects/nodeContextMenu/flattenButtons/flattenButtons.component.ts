import { Component, Input, ViewEncapsulation } from "@angular/core"
import { CodeMapNode } from "../../../../codeCharta.model"
import { Store } from "../../../angular-redux/store"
import { addBlacklistItem, removeBlacklistItem } from "../../../store/fileSettings/blacklist/blacklist.actions"

@Component({
	selector: "cc-flatten-buttons",
	templateUrl: "./flattenButtons.component.html",
	encapsulation: ViewEncapsulation.None
})
export class FlattenButtonsComponent {
	@Input() codeMapNode: Pick<CodeMapNode, "path" | "type" | "isFlattened">

	constructor(private store: Store) {}

	flattenNode() {
		this.store.dispatch(
			addBlacklistItem({
				path: this.codeMapNode.path,
				type: "flatten",
				nodeType: this.codeMapNode.type
			})
		)
	}

	unFlattenNode() {
		this.store.dispatch(
			removeBlacklistItem({
				path: this.codeMapNode.path,
				type: "flatten",
				nodeType: this.codeMapNode.type
			})
		)
	}
}
