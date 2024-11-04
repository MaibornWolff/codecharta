import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState, CodeMapNode, FileCount } from "../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { fileCountSelector } from "./fileCountSelector"

@Component({
    selector: "cc-node-path",
    templateUrl: "./nodePath.component.html",
    styleUrls: ["./nodePath.component.scss"]
})
export class NodePathComponent {
    @Input() node?: Pick<CodeMapNode, "path" | "children">
    fileCount$: Observable<FileCount | undefined>
    isDeltaMode$: Observable<boolean>

    constructor(store: Store<CcState>) {
        this.fileCount$ = store.select(fileCountSelector)
        this.isDeltaMode$ = store.select(isDeltaStateSelector)
    }
}
