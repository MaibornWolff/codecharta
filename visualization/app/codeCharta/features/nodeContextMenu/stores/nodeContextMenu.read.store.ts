import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { combineLatest, distinctUntilChanged, map, Observable, of, switchMap } from "rxjs"
import { pathsWithDependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { hasDomainDataSelector, pathsWithDomainWordsSelector } from "../../../lenses/domain/domainLens.facade"
import { CcState } from "../../../model/codeCharta.model"
import { flattenPredicateSelector, rightClickedCodeMapNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { dependencyViewEnabledSelector } from "../../../stores/preferences/preferences.read.facade"
import { keptHighlightPathsSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { currentMarkColorSelector, markFolderItemsSelector } from "../selectors/markFolderItems.selector"

const NO_PATHS: ReadonlySet<string> = new Set()

@Injectable({
    providedIn: "root"
})
export class NodeContextMenuReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly rightClickedCodeMapNode$ = this.store.select(rightClickedCodeMapNodeSelector)
    readonly markFolderItems$ = this.store.select(markFolderItemsSelector)
    readonly currentMarkColor$ = this.store.select(currentMarkColorSelector)
    readonly isFlattened$ = this.store.select(flattenPredicateSelector)
    readonly keptHighlightPaths$ = this.store.select(keptHighlightPathsSelector)

    // The lens paths are only looked up while the menu is open: the domain word index behind them is
    // expensive, and the menu is mounted in views whose users may never open the menu at all.
    readonly isRightClickedNodeInDomainLens$ = this.whileNodeIsRightClicked(() =>
        this.store
            .select(hasDomainDataSelector)
            .pipe(switchMap(hasDomainData => (hasDomainData ? this.store.select(pathsWithDomainWordsSelector) : of(NO_PATHS))))
    )
    readonly isRightClickedNodeInDependencyLens$ = this.whileNodeIsRightClicked(() =>
        combineLatest([this.store.select(dependencyViewEnabledSelector), this.store.select(isDeltaStateSelector)]).pipe(
            switchMap(([isEnabled, isDeltaState]) =>
                isEnabled && !isDeltaState ? this.store.select(pathsWithDependencyLevelsSelector) : of(NO_PATHS)
            )
        )
    )

    private whileNodeIsRightClicked(lensPaths: () => Observable<ReadonlySet<string>>): Observable<boolean> {
        return this.rightClickedCodeMapNode$.pipe(
            map(node => node?.path ?? null),
            distinctUntilChanged(),
            switchMap(nodePath => (nodePath === null ? of(false) : lensPaths().pipe(map(paths => paths.has(nodePath))))),
            distinctUntilChanged()
        )
    }
}
