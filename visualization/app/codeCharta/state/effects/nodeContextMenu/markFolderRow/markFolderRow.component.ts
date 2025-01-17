import { Component } from "@angular/core"
import { markPackages, unmarkPackage } from "../../../store/fileSettings/markedPackages/markedPackages.actions"
import { markFolderItemsSelector } from "./selectors/markFolderItems.selector"
import { CcState } from "../../../../codeCharta.model"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { Store } from "@ngrx/store"
import { ColorPickerComponent } from "../../../../ui/colorPicker/colorPicker.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-mark-folder-row",
    templateUrl: "./markFolderRow.component.html",
    styleUrls: ["./markFolderRow.component.scss"],
    standalone: true,
    imports: [ColorPickerComponent, AsyncPipe]
})
export class MarkFolderRowComponent {
    markFolderItems$ = this.store.select(markFolderItemsSelector)
    codeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)

    constructor(private readonly store: Store<CcState>) {}

    markFolder(path: string, color: string) {
        this.store.dispatch(markPackages({ packages: [{ path, color }] }))
    }

    unmarkFolder(path: string) {
        this.store.dispatch(unmarkPackage({ path }))
    }
}
