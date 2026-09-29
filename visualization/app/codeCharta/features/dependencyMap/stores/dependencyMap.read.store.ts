import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { edgesSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { CcState } from "../../../model/codeCharta.model"
import { edgeMetricDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { edgeMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { dependencyGraphSettingsSelector } from "../../../stores/preferences/preferences.read.facade"
import { hoveredNodePathSelector, selectedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { dependencySearchedPathsSelector, dependencyTreeSelector } from "../selectors/dependencyMap.selectors"

@Injectable({ providedIn: "root" })
export class DependencyMapReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly tree$ = this.store.select(dependencyTreeSelector)
    readonly edges$ = this.store.select(edgesSelector)
    /** Shared with the Metric view: picking one here picks it there. */
    readonly edgeMetric$ = this.store.select(edgeMetricSelector)
    readonly edgeMetricData$ = this.store.select(edgeMetricDataSelector)
    /** The bar's settings, kept across reloads. */
    readonly settings$ = this.store.select(dependencyGraphSettingsSelector)
    readonly hoveredNodePath$ = this.store.select(hoveredNodePathSelector)
    readonly selectedNodePath$ = this.store.select(selectedNodePathSelector)
    readonly isDeltaState$ = this.store.select(isDeltaStateSelector)
    readonly searchedPaths$ = this.store.select(dependencySearchedPathsSelector)
}
