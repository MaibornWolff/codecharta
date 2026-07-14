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
import { unfocusAllNodes } from "../../../stores/sharedView/sharedView.write.facade"
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
import { getMergedBlacklist } from "./utils/blacklist.merger"
import { getMergedMarkedPackages } from "./utils/markedPackages.merger"

/**
 * A file set arrived (a load, or a file-panel change: delta switch, file removal, re-selection).
 * `provenance` is null for the latter — those carry no URL metrics and never force an autofit.
 */
type FileSetTrigger = { kind: "fileSet"; provenance: FilesLoadedPayload | null }

/** The derived metric data changed without a file-set change — a blacklist edit removed a metric. */
type MetricDataTrigger = { kind: "metricData" }

type ReconcileTrigger = FileSetTrigger | MetricDataTrigger

/**
 * The single owner of "a file set changed → re-initialize". It replaces the loose cloud of effects
 * that each independently subscribed to the file selectors and reset one thing, in an emergent order.
 *
 * The sequence is deterministic and runs synchronously in one task:
 *
 *   1. merge the file settings (blacklist / markedPackages / attributeTypes / attributeDescriptors)
 *   1b. point the file root at the reference file
 *   2. derive the metric data — AFTER step 1, so it already sees the merged blacklist
 *   3. resolve the metric selection, precedence URL > persisted > computed default
 *   4. derive the color range from the resolved color metric — once
 *   5. unfocus the nodes, lower the top-label count to what the new map can carry
 *   6. apply the RESTORED session on top — persisted beats everything derived from the files
 *
 * Steps 7 (camera autofit) and 8 (clear the loading indicator) belong to the same sequence but live
 * in features/codeMap/, because they need the renderer. They key off the same `filesLoaded` action.
 *
 * Deriving the metric data from the snapshot in step 2 — rather than from a selector subscription —
 * is what removes the need for the `skip(1), take(1)` / `withLatestFrom` staleness workarounds the
 * old effects needed: by construction, everything read here is post-step-1.
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
     * A load dispatches several file actions (each makes visibleFileStatesSelector emit) plus exactly
     * one `filesLoaded`, all synchronously in one task. We buffer that whole burst and reconcile once,
     * against the state it leaves behind.
     *
     * The burst is REDUCED, not merely debounced: `filesLoaded` is not necessarily the last thing in it
     * (the restore branch sets the persisted file states afterwards), so taking the last trigger would
     * silently drop the provenance and with it the URL metrics. Any `filesLoaded` in the burst wins.
     *
     * A pure file-panel change (delta switch, file removal, re-selection) emits only the selector, so
     * the provenance stays null and the sequence runs without URL metrics and without forcing a fit.
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
     * A blacklist edit can remove the metric that is currently selected. It changes the derived metric
     * data without changing the file set, so it re-runs steps 2-4 only: it must NOT unfocus nodes or
     * reset the top-label count, neither of which the old effects did on a blacklist edit.
     *
     * On a load this fires too, right after the file-set trigger — and dispatches nothing, because the
     * sequence is idempotent: the metrics are already resolved, so nothing has changed.
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
            this.store.dispatch(unfocusAllNodes())
            this.updateVisibleTopLabels()
            this.applyRestoredSettings(trigger.provenance?.restoredSettings ?? null)
        }
    }

    /**
     * Step 6 — the persisted session wins over everything the sequence derived from the files.
     *
     * This runs LAST on purpose. A user's exclusions, marked packages and focused node live ONLY in the
     * persisted state — they are never written back into a file's own fileSettings — so step 1's merge and
     * step 5's unfocus would erase them. Applying the persisted view after them states the precedence
     * explicitly: **persisted > file-derived**.
     *
     * Each applier diffs against what the sequence just wrote and dispatches only the differences, so a
     * fresh load (restoredSettings === null) costs nothing.
     */
    private applyRestoredSettings(restoredSettings: RestoredSettings | null): void {
        if (!restoredSettings) {
            return
        }

        this.loadInitialFileStore.applyMetricsLensSource(restoredSettings.metricsLensSource)
        this.loadInitialFileStore.applyDependencyLensSource(restoredSettings.dependencyLensSource)
        this.loadInitialFileStore.applySharedView(restoredSettings.sharedView)
    }

    // ───────────────────────────── step 1: the file settings ─────────────────────────────

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
                        blacklist: getMergedBlacklist(visibleFiles, withUpdatedPath),
                        markedPackages: getMergedMarkedPackages(visibleFiles, withUpdatedPath)
                    },
                    metricsLensSource: {
                        attributeTypes: mergedAttributeTypes.nodes,
                        attributeDescriptors: getMergedAttributeDescriptors(allAttributeDescriptors)
                    },
                    dependencyLensSource: {
                        attributeTypes: mergedAttributeTypes.edges
                    }
                }
            })
        )
    }

    // ───────────────────── step 1b: the root path of the map ─────────────────────

    private updateFileRoot(): void {
        const referenceFile = this.fileStoreReadWindow.getReferenceFile()
        if (referenceFile) {
            fileRoot.updateRoot(referenceFile.map.name)
        }
    }

    // ───────────────────────── step 3: the metric selection ─────────────────────────

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

    // ───────────────────────────── step 5: the top labels ─────────────────────────────

    private updateVisibleTopLabels(): void {
        const codeMapNodes = codeMapNodesSelector(this.ccStateSnapshot.get())
        const storedAmountOfTopLabels = this.mapStateReadWindow.getAmountOfTopLabels()
        this.store.dispatch(setAmountOfTopLabels({ value: Math.min(storedAmountOfTopLabels, getNumberOfTopLabels(codeMapNodes)) }))
    }
}
