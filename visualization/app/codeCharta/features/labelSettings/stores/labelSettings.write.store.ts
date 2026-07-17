import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorLabelOptions, LabelMode } from "../../../model/codeCharta.model"
import { defaultAmountOfTopLabels } from "../../../stores/mapState/mapState.read.facade"
import {
    setAmountOfTopLabels,
    setColorLabels,
    setGroupLabelCollisions,
    setLabelMode,
    setLabelSize,
    setLabelsPerMap,
    setShowMetricLabelNameValue,
    setShowMetricLabelNodeName
} from "../../../stores/mapState/mapState.write.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { setState } from "../../../stores/rootStore/state.actions"
import { getPartialDefaultState } from "../../shared/facade"

@Injectable({
    providedIn: "root"
})
export class LabelSettingsWriteStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly ccStateSnapshot: CcStateSnapshot
    ) {}

    setLabelMode(value: LabelMode) {
        this.store.dispatch(setLabelMode({ value }))
    }

    setAmountOfTopLabels(value: number) {
        this.store.dispatch(setAmountOfTopLabels({ value }))
    }

    setLabelSize(value: number) {
        this.store.dispatch(setLabelSize({ value }))
    }

    setLabelsPerMap(value: boolean) {
        this.store.dispatch(setLabelsPerMap({ value }))
    }

    setShowMetricLabelNodeName(value: boolean) {
        this.store.dispatch(setShowMetricLabelNodeName({ value }))
    }

    setShowMetricLabelNameValue(value: boolean) {
        this.store.dispatch(setShowMetricLabelNameValue({ value }))
    }

    setColorLabels(value: Partial<ColorLabelOptions>) {
        this.store.dispatch(setColorLabels({ value }))
    }

    setGroupLabelCollisions(value: boolean) {
        this.store.dispatch(setGroupLabelCollisions({ value }))
    }

    resetSettings(keys: string[]) {
        const partialDefaultState = getPartialDefaultState(keys, this.ccStateSnapshot.get())
        if (partialDefaultState.mapState?.amountOfTopLabels !== undefined) {
            partialDefaultState.mapState.amountOfTopLabels = defaultAmountOfTopLabels
        }
        this.store.dispatch(setState({ value: partialDefaultState }))
    }
}
