import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { markPackages, unmarkPackage } from "../../../sharedView/sharedView.facade"
import { currentMarkColorSelector, markFolderItemsSelector } from "../selectors/markFolderItems.selector"

@Injectable({
    providedIn: "root"
})
export class MarkFolderStore {
    constructor(private readonly store: Store<CcState>) {}

    markFolderItems$ = this.store.select(markFolderItemsSelector)
    currentMarkColor$ = this.store.select(currentMarkColorSelector)

    markFolder(path: string, color: string) {
        this.store.dispatch(markPackages({ packages: [{ path, color }] }))
    }

    unmarkFolder(path: string) {
        this.store.dispatch(unmarkPackage({ path }))
    }
}
