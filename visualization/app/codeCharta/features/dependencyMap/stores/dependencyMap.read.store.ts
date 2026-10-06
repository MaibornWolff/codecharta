import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import {
    dependencyDeclarationsSelector,
    edgesSelector,
    hasDeclarationsSelector,
    hasDependencyDataSelector,
    hasPackagesSelector
} from "../../../lenses/dependency/dependencyLens.facade"
import { CcState } from "../../../model/codeCharta.model"
import { edgeMetricDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { edgeMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { dependencyGraphSettingsSelector } from "../../../stores/preferences/preferences.read.facade"
import {
    currentFocusedNodePathSelector,
    hoveredNodePathSelector,
    selectedNodePathSelector
} from "../../../stores/sharedView/sharedView.read.facade"
import {
    dependencyLayoutIdentitySelector,
    dependencySearchedPathsOrNullSelector,
    dependencyTreeSelector,
    focusedFolderLevelPathSelector,
    isDependencyMapFocusedSelector
} from "../selectors/dependencyMap.selectors"

@Injectable({ providedIn: "root" })
export class DependencyMapReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly tree$ = this.store.select(dependencyTreeSelector)
    readonly focusedFolderLevelPath$ = this.store.select(focusedFolderLevelPathSelector)
    readonly layoutIdentity$ = this.store.select(dependencyLayoutIdentitySelector)
    readonly hasDependencyData$ = this.store.select(hasDependencyDataSelector)
    readonly isFocused$ = this.store.select(isDependencyMapFocusedSelector)
    readonly focusedNodePath$ = this.store.select(currentFocusedNodePathSelector)
    readonly edges$ = this.store.select(edgesSelector)
    readonly declarations$ = this.store.select(dependencyDeclarationsSelector)
    readonly hasDeclarations$ = this.store.select(hasDeclarationsSelector)
    readonly hasPackages$ = this.store.select(hasPackagesSelector)
    readonly sharedEdgeMetric$ = this.store.select(edgeMetricSelector)
    readonly edgeMetricData$ = this.store.select(edgeMetricDataSelector)
    readonly persistedSettings$ = this.store.select(dependencyGraphSettingsSelector)
    readonly hoveredNodePath$ = this.store.select(hoveredNodePathSelector)
    readonly selectedNodePath$ = this.store.select(selectedNodePathSelector)
    readonly isDeltaState$ = this.store.select(isDeltaStateSelector)
    readonly searchedPaths$ = this.store.select(dependencySearchedPathsOrNullSelector)
}
