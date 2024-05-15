import { Component, ViewEncapsulation } from "@angular/core"
import { markPackages, unmarkPackage } from "../../../store/fileSettings/markedPackages/markedPackages.actions"
import { markFolderItemsSelector } from "./selectors/markFolderItems.selector"
import { CcState } from "../../../../codeCharta.model"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { Store } from "@ngrx/store"

@Component({
    selector: "cc-mark-folder-row",
    templateUrl: "./markFolderRow.component.html",
    styleUrls: ["./markFolderRow.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class MarkFolderRowComponent {
    markFolderItems$ = this.store.select(markFolderItemsSelector)
    codeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)

    constructor(private store: Store<CcState>) {}

    markFolder(path: string, color: string) {
        this.store.dispatch(markPackages({ packages: [{ path, color }] }))
    }

    unmarkFolder(path: string) {
        this.store.dispatch(unmarkPackage({ path }))
    }
}
