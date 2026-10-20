import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Action, Store } from "@ngrx/store"
import { buffer, combineLatest, debounceTime, filter, map, merge, share, skip, tap } from "rxjs"
import { CcState } from "../../../model/codeCharta.model"
import { getVisibleFiles, isPartialState } from "../../../model/files/files.helper"
import {
    codeMapNodesSelector,
    edgeMetricDataSelector,
    metricDataSelector,
    nodeMetricDataSelector
} from "../../../renderer/renderModel/renderModel.facade"
import {
    FileStoreReadWindow,
    FilesLoadedPayload,
    filesLoaded,
    RestoredSettings,
    visibleFileStatesSelector
} from "../../../stores/fileStore/fileStore.facade"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import {
    setAmountOfTopLabels,
    setAreaMetric,
    setColorMetric,
    setColorRange,
    setDistributionMetric,
    setEdgeMetric,
    setHeightMetric
} from "../../../stores/mapState/mapState.write.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { setState } from "../../../stores/rootStore/state.actions"
import { unfocusNode } from "../../../stores/sharedView/sharedView.write.facade"
import { calculateInitialColorRange } from "../../../util/color/calculateInitialColorRange"
import { fileRoot } from "../../../util/fileRoot"
import { getNumberOfTopLabels } from "../../../util/getNumberOfTopLabels"
import { rangeOfMetric } from "../../../util/metric/metricRange"
import { NO_URL_METRICS } from "../../../util/queryParameter/queryParameter"
import { QueryParamsService } from "../../../util/queryParameter/queryParams.service"
import { LoadInitialFileStore } from "../../loadInitialFile.store"
import { MetricSelection, resolveMetricSelection } from "./resolveMetricSelection"
import { getMergedAttributeDescriptors } from "./utils/attributeDescriptors.merger"
import { getMergedAttributeTypes } from "./utils/attributeTypes.merger"
import { getMergedDomainWords } from "./utils/domainWords.merger"
import { getMergedMarkedPackages } from "./utils/markedPackages.merger"
import { getMergedNodeRules } from "./utils/nodeRules.merger"

/** `provenance` is null for a file-panel change, which carries no URL metrics and never forces an autofit. */
type FileSetTrigger = { kind: "fileSet"; provenance: FilesLoadedPayload | null }

/** An exclude rule removed a metric without changing the file set. */
type MetricDataTrigger = { kind: "metricData" }

type ReconcileTrigger = FileSetTrigger | MetricDataTrigger

/**
 * Camera autofit and clearing the loading indicator follow the same `filesLoaded` action but live in
 * features/codeMap/, because they need the renderer.
 *
 * The metric data is derived from the snapshot instead of a selector subscription, so everything read
 * here already sees the merged file settings without staleness workarounds.
 */
@Injectable()
export class ReconcileAfterLoadEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>,
        private readonly ccStateSnapshot: CcStateSnapshot,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly queryParamsService: QueryParamsService,
        private readonly loadInitialFileStore: LoadInitialFileStore
    ) {}

    private readonly fileSetTriggers$ = merge(
        this.actions$.pipe(
            ofType(filesLoaded),
            map((action: FilesLoadedPayload & Action): FileSetTrigger => ({ kind: "fileSet", provenance: action }))
        ),
        this.store.select(visibleFileStatesSelector).pipe(
            skip(1),
            map((): FileSetTrigger => ({ kind: "fileSet", provenance: null }))
        )
    ).pipe(share())

    /**
     * A load emits a synchronous burst of file actions plus one `filesLoaded`, which is not necessarily
     * last (the restore branch sets the persisted file states afterwards). The burst is reduced so that
     * any `filesLoaded` in it keeps its provenance, and with it the URL metrics.
     */
    private readonly fileSetChanged$ = this.fileSetTriggers$.pipe(
        buffer(this.fileSetTriggers$.pipe(debounceTime(0))),
        filter(triggers => triggers.length > 0),
        map(
            (triggers): FileSetTrigger => ({
                kind: "fileSet",
                provenance: triggers.find(trigger => trigger.provenance)?.provenance ?? null
            })
        )
    )

    reconcileFileSet$ = createEffect(
        () =>
            this.fileSetChanged$.pipe(
                tap(trigger => {
                    this.reconcile(trigger)
                })
            ),
        { dispatch: false }
    )

    /**
     * A rule change must not unfocus nodes or reset the top-label count. On a load this fires too, but
     * dispatches nothing because the metrics are already resolved.
     */
    reconcileMetricData$ = createEffect(
        () =>
            combineLatest([this.store.select(nodeMetricDataSelector), this.store.select(edgeMetricDataSelector)]).pipe(
                skip(1),
                debounceTime(0),
                tap(() => {
                    this.reconcile({ kind: "metricData" })
                })
            ),
        { dispatch: false }
    )

    private reconcile(trigger: ReconcileTrigger): void {
        if (trigger.kind === "fileSet") {
            this.mergeFileSettings()
            this.updateFileRoot()
        }

        const { nodeMetricData, edgeMetricData } = metricDataSelector(this.ccStateSnapshot.get())
        if (!nodeMetricData) {
            return
        }

        const current = this.currentSelection()
        const resolved = resolveMetricSelection(
            trigger.kind === "fileSet" ? (trigger.provenance?.urlMetrics ?? NO_URL_METRICS) : NO_URL_METRICS,
            current,
            nodeMetricData,
            edgeMetricData,
            this.queryParamsService.hasFile(),
            trigger.kind === "fileSet" && Boolean(trigger.provenance?.forceDefaultMetrics)
        )
        if (!resolved) {
            return
        }

        this.applySelection(resolved, current)

        const hasColorMetricChanged = resolved.colorMetric !== current.colorMetric
        if (trigger.kind === "fileSet" || hasColorMetricChanged) {
            const colorMetricRange = rangeOfMetric(nodeMetricData, resolved.colorMetric)
            this.store.dispatch(setColorRange({ value: calculateInitialColorRange(colorMetricRange) }))
        }

        if (trigger.kind === "fileSet") {
            this.store.dispatch(unfocusNode())
            this.updateVisibleTopLabels()
            this.applyRestoredSettings(trigger.provenance?.restoredSettings ?? null)
        }
    }

    /**
     * Runs last on purpose: exclusions, marked packages and the focused node live only in the persisted
     * state, so the file-settings merge and the unfocus would otherwise erase them.
     */
    private applyRestoredSettings(restoredSettings: RestoredSettings | null): void {
        if (!restoredSettings) {
            return
        }

        this.loadInitialFileStore.applyMetricsLensSource(restoredSettings.metricsLensSource)
        this.loadInitialFileStore.applyDependencyLensSource(restoredSettings.dependencyLensSource)
        this.loadInitialFileStore.applyDomainLensSource(restoredSettings.domainLensSource)
        this.loadInitialFileStore.applySharedView(restoredSettings.sharedView)
    }

    private mergeFileSettings(): void {
        const files = this.fileStoreReadWindow.getFiles()
        const visibleFiles = getVisibleFiles(files)
        const withUpdatedPath = isPartialState(files)
        const visibleFileStates = this.fileStoreReadWindow.getVisibleFileStates()
        const allAttributeTypes = visibleFileStates.map(({ file }) => file.settings.fileSettings.attributeTypes)
        const allAttributeDescriptors = visibleFileStates.map(({ file }) => file.settings.fileSettings.attributeDescriptors)
        const mergedAttributeTypes = getMergedAttributeTypes(allAttributeTypes)

        this.store.dispatch(
            setState({
                value: {
                    sharedView: {
                        ...getMergedNodeRules(visibleFiles, withUpdatedPath),
                        markedPackages: getMergedMarkedPackages(visibleFiles, withUpdatedPath)
                    },
                    metricsLensSource: {
                        attributeTypes: mergedAttributeTypes.nodes,
                        attributeDescriptors: getMergedAttributeDescriptors(allAttributeDescriptors)
                    },
                    dependencyLensSource: {
                        attributeTypes: mergedAttributeTypes.edges
                    },
                    domainLensSource: {
                        words: getMergedDomainWords(visibleFiles, withUpdatedPath)
                    }
                }
            })
        )
    }

    private updateFileRoot(): void {
        const referenceFile = this.fileStoreReadWindow.getReferenceFile()
        if (referenceFile) {
            fileRoot.updateRoot(referenceFile.map.name)
        }
    }

    private currentSelection(): MetricSelection {
        const { areaMetric, heightMetric, colorMetric, edgeMetric, distributionMetric } = this.mapStateReadWindow.getMapState()
        return { areaMetric, heightMetric, colorMetric, edgeMetric, distributionMetric }
    }

    private applySelection(resolved: MetricSelection, current: MetricSelection): void {
        this.dispatchIfChanged(setDistributionMetric, resolved.distributionMetric, current.distributionMetric)
        this.dispatchIfChanged(setAreaMetric, resolved.areaMetric, current.areaMetric)
        this.dispatchIfChanged(setHeightMetric, resolved.heightMetric, current.heightMetric)
        this.dispatchIfChanged(setColorMetric, resolved.colorMetric, current.colorMetric)
        this.dispatchIfChanged(setEdgeMetric, resolved.edgeMetric, current.edgeMetric)
    }

    private dispatchIfChanged(actionCreator: (props: { value: string }) => Action, next: string, previous: string): void {
        if (next !== previous) {
            this.store.dispatch(actionCreator({ value: next }))
        }
    }

    private updateVisibleTopLabels(): void {
        const codeMapNodes = codeMapNodesSelector(this.ccStateSnapshot.get())
        const storedAmountOfTopLabels = this.mapStateReadWindow.getAmountOfTopLabels()
        this.store.dispatch(setAmountOfTopLabels({ value: Math.min(storedAmountOfTopLabels, getNumberOfTopLabels(codeMapNodes)) }))
    }
}
