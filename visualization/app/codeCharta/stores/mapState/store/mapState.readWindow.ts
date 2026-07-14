import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, ColorMode, ColorRange, MapColors, MapState } from "../../../model/codeCharta.model"
import { amountOfEdgePreviewsSelector } from "./amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { amountOfTopLabelsSelector } from "./amountOfTopLabels/amountOfTopLabels.selector"
import { areaMetricSelector } from "./areaMetric/areaMetric.selector"
import { colorLabelsSelector } from "./colorLabels/colorLabels.selector"
import { colorMetricSelector } from "./colorMetric/colorMetric.selector"
import { colorModeSelector } from "./colorMode/colorMode.selector"
import { colorRangeSelector } from "./colorRange/colorRange.selector"
import { edgeHeightSelector } from "./edgeHeight/edgeHeight.selector"
import { edgeMetricSelector } from "./edgeMetric/edgeMetric.selector"
import { enableFloorLabelsSelector } from "./enableFloorLabels/enableFloorLabels.selector"
import { groupLabelCollisionsSelector } from "./groupLabelCollisions/groupLabelCollisions.selector"
import { heightMetricSelector } from "./heightMetric/heightMetric.selector"
import { hideFlatBuildingsSelector } from "./hideFlatBuildings/hideFlatBuildings.selector"
import { invertAreaSelector } from "./invertArea/invertArea.selector"
import { invertHeightSelector } from "./invertHeight/invertHeight.selector"
import { isEdgeMetricVisibleSelector } from "./isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { isWhiteBackgroundSelector } from "./isWhiteBackground/isWhiteBackground.selector"
import { labelModeSelector } from "./labelMode/labelMode.selector"
import { labelSizeSelector } from "./labelSize/labelSize.selector"
import { labelsPerMapSelector } from "./labelsPerMap/labelsPerMap.selector"
import { layoutAlgorithmSelector } from "./layoutAlgorithm/layoutAlgorithm.selector"
import { mapColorsSelector } from "./mapColors/mapColors.selector"
import { marginSelector } from "./margin/margin.selector"
import { scalingSelector } from "./scaling/scaling.selector"
import { showIncomingEdgesSelector } from "./showEdges/incoming/showIncomingEdges.selector"
import { showOutgoingEdgesSelector } from "./showEdges/outgoing/showOutgoingEdges.selector"
import { showMetricLabelNameValueSelector } from "./showMetricLabelNameValue/showMetricLabelNameValue.selector"
import { showMetricLabelNodeNameSelector } from "./showMetricLabelNodeName/showMetricLabelNodeName.selector"
import { showOnlyBuildingsWithEdgesSelector } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.selector"

@Injectable({
    providedIn: "root"
})
export class MapStateReadWindow {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly areaMetric$ = this.store.select(areaMetricSelector)
    readonly heightMetric$ = this.store.select(heightMetricSelector)
    readonly colorMetric$ = this.store.select(colorMetricSelector)
    readonly edgeMetric$ = this.store.select(edgeMetricSelector)
    readonly colorRange$ = this.store.select(colorRangeSelector)
    readonly colorMode$ = this.store.select(colorModeSelector)
    readonly mapColors$ = this.store.select(mapColorsSelector)
    readonly margin$ = this.store.select(marginSelector)
    readonly scaling$ = this.store.select(scalingSelector)
    readonly invertArea$ = this.store.select(invertAreaSelector)
    readonly invertHeight$ = this.store.select(invertHeightSelector)
    readonly hideFlatBuildings$ = this.store.select(hideFlatBuildingsSelector)
    readonly isWhiteBackground$ = this.store.select(isWhiteBackgroundSelector)
    readonly layoutAlgorithm$ = this.store.select(layoutAlgorithmSelector)
    readonly edgeHeight$ = this.store.select(edgeHeightSelector)
    readonly amountOfEdgePreviews$ = this.store.select(amountOfEdgePreviewsSelector)
    readonly isEdgeMetricVisible$ = this.store.select(isEdgeMetricVisibleSelector)
    readonly showIncomingEdges$ = this.store.select(showIncomingEdgesSelector)
    readonly showOutgoingEdges$ = this.store.select(showOutgoingEdgesSelector)
    readonly showOnlyBuildingsWithEdges$ = this.store.select(showOnlyBuildingsWithEdgesSelector)
    readonly labelMode$ = this.store.select(labelModeSelector)
    readonly labelSize$ = this.store.select(labelSizeSelector)
    readonly labelsPerMap$ = this.store.select(labelsPerMapSelector)
    readonly amountOfTopLabels$ = this.store.select(amountOfTopLabelsSelector)
    readonly colorLabels$ = this.store.select(colorLabelsSelector)
    readonly groupLabelCollisions$ = this.store.select(groupLabelCollisionsSelector)
    readonly enableFloorLabels$ = this.store.select(enableFloorLabelsSelector)
    readonly showMetricLabelNodeName$ = this.store.select(showMetricLabelNodeNameSelector)
    readonly showMetricLabelNameValue$ = this.store.select(showMetricLabelNameValueSelector)

    getMapState(): MapState {
        return this.state.getValue().mapState
    }

    getAreaMetric(): string {
        return this.state.getValue().mapState.areaMetric
    }

    getHeightMetric(): string {
        return this.state.getValue().mapState.heightMetric
    }

    getColorMetric(): string {
        return this.state.getValue().mapState.colorMetric
    }

    getEdgeMetric(): string {
        return this.state.getValue().mapState.edgeMetric
    }

    getColorRange(): ColorRange {
        return this.state.getValue().mapState.colorRange
    }

    getColorMode(): ColorMode {
        return this.state.getValue().mapState.colorMode
    }

    getMapColors(): MapColors {
        return this.state.getValue().mapState.mapColors
    }

    getAmountOfTopLabels(): number {
        return this.state.getValue().mapState.amountOfTopLabels
    }
}
