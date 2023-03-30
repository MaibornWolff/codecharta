import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CodeMapNode, FileCount, State } from "../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { fileCountSelector } from "./fileCountSelector"

@Component({
	selector: "cc-node-path",
	templateUrl: "./nodePath.component.html",
	encapsulation: ViewEncapsulation.None
})
export class NodePathComponent {
	@Input() node?: Pick<CodeMapNode, "path" | "children">
	fileCount$: Observable<FileCount | undefined>
	isDeltaMode$: Observable<boolean>

	constructor(store: Store<State>) {
		this.fileCount$ = store.select(fileCountSelector)
		this.isDeltaMode$ = store.select(isDeltaStateSelector)
	}
}
