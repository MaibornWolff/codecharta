import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { clusteringsSelector, hasClusteringsSelector } from "../../../lenses/clusters/clusters.facade"
import { CcState } from "../../../model/codeCharta.model"
import { shownFilePathsSelector } from "../selectors/shownFilePaths.selector"

@Injectable({
    providedIn: "root"
})
export class ClusterExplorerReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly clusterings$ = this.store.select(clusteringsSelector)
    readonly hasClusterings$ = this.store.select(hasClusteringsSelector)
    readonly shownFilePaths$ = this.store.select(shownFilePathsSelector)
}
