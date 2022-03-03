import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../../../state/angular-redux/store"
import { CodeMapNode } from "../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { fileCountDescriptionSelector, FileCounter } from "./fileCountDescription.selector"

@Component({
	selector: "cc-node-path",
	template: require("./nodePath.component.html")
})
export class NodePathComponent {
	@Input() node?: Pick<CodeMapNode, "path" | "children">
	fileCountDescription$: Observable<FileCounter | undefined>
	isDeltaMode$: Observable<boolean>

	constructor(@Inject(Store) store: Store) {
		this.fileCountDescription$ = store.select(fileCountDescriptionSelector)
		this.isDeltaMode$ = store.select(isDeltaStateSelector)
	}
}
