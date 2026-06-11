import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, MarkedPackage } from "../../../codeCharta.model"
import { markPackages, unmarkPackage } from "../../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { markableFolderPathsSelector } from "../selectors/markableFolderPaths.selector"
import { markedPackagesWithCountsSelector } from "../selectors/markedPackagesWithCounts.selector"

@Injectable({
    providedIn: "root"
})
export class FolderOverridesStore {
    constructor(private readonly store: Store<CcState>) {}

    markedPackagesWithCounts$ = this.store.select(markedPackagesWithCountsSelector)

    markableFolderPaths$ = this.store.select(markableFolderPathsSelector)

    markPackage(markedPackage: MarkedPackage) {
        this.store.dispatch(markPackages({ packages: [markedPackage] }))
    }

    unmarkPackage(path: string) {
        this.store.dispatch(unmarkPackage({ path }))
    }
}
