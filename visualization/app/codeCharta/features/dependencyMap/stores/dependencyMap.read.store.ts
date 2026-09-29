import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { edgesSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { CcState } from "../../../model/codeCharta.model"
import { isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { hoveredNodePathSelector, selectedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { dependencySearchedPathsSelector, dependencyTreeSelector } from "../selectors/dependencyMap.selectors"

@Injectable({ providedIn: "root" })
export class DependencyMapReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly tree$ = this.store.select(dependencyTreeSelector)
    readonly edges$ = this.store.select(edgesSelector)
    readonly hoveredNodePath$ = this.store.select(hoveredNodePathSelector)
    readonly selectedNodePath$ = this.store.select(selectedNodePathSelector)
    readonly isDeltaState$ = this.store.select(isDeltaStateSelector)
    readonly searchedPaths$ = this.store.select(dependencySearchedPathsSelector)
}
