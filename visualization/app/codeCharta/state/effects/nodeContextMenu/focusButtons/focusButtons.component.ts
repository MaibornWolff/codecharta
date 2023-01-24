import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Observable, map } from "rxjs"

import { CodeMapNode } from "../../../../codeCharta.model"
import { Store } from "../../../angular-redux/store"
import { currentFocusedNodePathSelector } from "../../../store/dynamicSettings/focusedNodePath/currentFocused.selector"
import { focusNode, unfocusAllNodes, unfocusNode } from "../../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { focusedNodePathSelector } from "../../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"

@Component({
	selector: "cc-focus-buttons",
	templateUrl: "./focusButtons.component.html",
	encapsulation: ViewEncapsulation.None
})
export class FocusButtonsComponent {
	@Input() codeMapNode: Pick<CodeMapNode, "path">

	currentFocusedNodePath$: Observable<string | undefined>
	hasPreviousFocusedNodePath$: Observable<boolean>

	constructor(private store: Store) {
		this.currentFocusedNodePath$ = this.store.select(currentFocusedNodePathSelector)
		this.hasPreviousFocusedNodePath$ = this.store
			.select(focusedNodePathSelector)
			.pipe(map(focusedNodePaths => focusedNodePaths.length > 1))
	}

	handleFocusNodeClicked() {
		this.store.dispatch(focusNode(this.codeMapNode.path))
	}

	handleUnfocusNodeClicked() {
		this.store.dispatch(unfocusNode())
	}

	handleUnfocusAllNodesClicked() {
		this.store.dispatch(unfocusAllNodes())
	}
}
