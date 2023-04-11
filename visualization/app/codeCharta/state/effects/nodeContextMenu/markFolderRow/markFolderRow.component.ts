import { Component, ViewEncapsulation } from "@angular/core"
import { markPackages, unmarkPackage } from "../../../store/fileSettings/markedPackages/markedPackages.actions"
import { Observable } from "rxjs"
import { MarkFolderItem, markFolderItemsSelector } from "./selectors/markFolderItems.selector"
import { CodeMapNode, CcState } from "../../../../codeCharta.model"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { Store } from "@ngrx/store"

@Component({
	selector: "cc-mark-folder-row",
	templateUrl: "./markFolderRow.component.html",
	styleUrls: ["./markFolderRow.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class MarkFolderRowComponent {
	markFolderItems$: Observable<MarkFolderItem[]>
	codeMapNode$: Observable<CodeMapNode>

	constructor(private store: Store<CcState>) {
		this.markFolderItems$ = store.select(markFolderItemsSelector)
		this.codeMapNode$ = store.select(rightClickedCodeMapNodeSelector)
	}

	markFolder(path: string, color: string) {
		this.store.dispatch(markPackages({ packages: [{ path, color }] }))
	}

	unmarkFolder(path: string) {
		this.store.dispatch(unmarkPackage({ path }))
	}
}
