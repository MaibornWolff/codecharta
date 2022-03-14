import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../../../state/angular-redux/store"
import { CodeMapNode, FileCount } from "../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { fileCountSelector } from "./fileCountSelector"

@Component({
	selector: "cc-node-path",
	template: require("./nodePath.component.html")
})
export class NodePathComponent {
	@Input() node?: Pick<CodeMapNode, "path" | "children">
	fileCount$: Observable<FileCount | undefined>
	isDeltaMode$: Observable<boolean>

	constructor(@Inject(Store) store: Store) {
		this.fileCount$ = store.select(fileCountSelector)
		this.isDeltaMode$ = store.select(isDeltaStateSelector)
	}
}
