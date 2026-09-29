import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { pathsWithDependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { pathsWithDomainWordsSelector } from "../../../lenses/domain/domainLens.facade"
import { CcState } from "../../../model/codeCharta.model"
import { flattenPredicateSelector, rightClickedCodeMapNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { keptHighlightPathsSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { currentMarkColorSelector, markFolderItemsSelector } from "../selectors/markFolderItems.selector"

@Injectable({
    providedIn: "root"
})
export class NodeContextMenuReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly rightClickedCodeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)
    readonly markFolderItems$ = this.store.select(markFolderItemsSelector)
    readonly currentMarkColor$ = this.store.select(currentMarkColorSelector)
    readonly pathsWithDomainWords$ = this.store.select(pathsWithDomainWordsSelector)
    readonly isDeltaState$ = this.store.select(isDeltaStateSelector)
    readonly pathsWithDependencyLevels$ = this.store.select(pathsWithDependencyLevelsSelector)
    readonly isFlattened$ = this.store.select(flattenPredicateSelector)
    readonly keptHighlightPaths$ = this.store.select(keptHighlightPathsSelector)
}
