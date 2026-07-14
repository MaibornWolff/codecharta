import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorMode, ColorRange, MapColors, MarkedPackage, Scaling } from "../../../model/codeCharta.model"
import {
    invertColorRange,
    invertDeltaColors,
    setAmountOfEdgePreviews,
    setAreaMetric,
    setColorMetric,
    setColorMode,
    setColorRange,
    setEdgeHeight,
    setEdgeMetric,
    setEnableFloorLabels,
    setHeightMetric,
    setInvertArea,
    setInvertHeight,
    setMapColors,
    setMargin,
    setScaling,
    setShowIncomingEdges,
    setShowOnlyBuildingsWithEdges,
    setShowOutgoingEdges,
    toggleEdgeMetricVisible
} from "../../../stores/mapState/mapState.write.facade"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../stores/preferences/preferences.write.facade"
import { markPackages, unmarkPackage } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable({
    providedIn: "root"
})
export class MetricsBarWriteStore {
    constructor(private readonly store: Store<CcState>) {}

    setAreaMetric(value: string) {
        this.store.dispatch(setAreaMetric({ value }))
    }

    setHeightMetric(value: string) {
        this.store.dispatch(setHeightMetric({ value }))
    }

    setColorMetric(value: string) {
        this.store.dispatch(setColorMetric({ value }))
    }

    setEdgeMetric(value: string) {
        this.store.dispatch(setEdgeMetric({ value }))
    }

    setMargin(value: number) {
        this.store.dispatch(setMargin({ value }))
    }

    setInvertArea(value: boolean) {
        this.store.dispatch(setInvertArea({ value }))
    }

    setEnableFloorLabels(value: boolean) {
        this.store.dispatch(setEnableFloorLabels({ value }))
    }

    setScaling(value: Partial<Scaling>) {
        this.store.dispatch(setScaling({ value }))
    }

    setInvertHeight(value: boolean) {
        this.store.dispatch(setInvertHeight({ value }))
    }

    setColorRange(value: Partial<ColorRange>) {
        this.store.dispatch(setColorRange({ value }))
    }

    setColorMode(value: ColorMode) {
        this.store.dispatch(setColorMode({ value }))
    }

    setMapColors(value: Partial<MapColors>) {
        this.store.dispatch(setMapColors({ value }))
    }

    invertColorRange() {
        this.store.dispatch(invertColorRange())
    }

    invertDeltaColors() {
        this.store.dispatch(invertDeltaColors())
    }

    setEdgeHeight(value: number) {
        this.store.dispatch(setEdgeHeight({ value }))
    }

    setAmountOfEdgePreviews(value: number) {
        this.store.dispatch(setAmountOfEdgePreviews({ value }))
    }

    toggleEdgeMetricVisible() {
        this.store.dispatch(toggleEdgeMetricVisible())
    }

    setShowIncomingEdges(value: boolean) {
        this.store.dispatch(setShowIncomingEdges({ value }))
    }

    setShowOutgoingEdges(value: boolean) {
        this.store.dispatch(setShowOutgoingEdges({ value }))
    }

    setShowOnlyBuildingsWithEdges(value: boolean) {
        this.store.dispatch(setShowOnlyBuildingsWithEdges({ value }))
    }

    toggleIsHeightAndColorMetricLinked() {
        this.store.dispatch(toggleIsColorMetricLinkedToHeightMetric())
    }

    markPackage(markedPackage: MarkedPackage) {
        this.store.dispatch(markPackages({ packages: [markedPackage] }))
    }

    unmarkPackage(path: string) {
        this.store.dispatch(unmarkPackage({ path }))
    }
}
