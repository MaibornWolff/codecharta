import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { labelsPerMapActiveSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areMultipleMapsVisibleSelector, isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { defaultAmountOfTopLabels, mapColorsSelector } from "../../../stores/mapState/mapState.read.facade"
import { setState } from "../../../stores/rootStore/state.actions"
import { getPartialDefaultState } from "../../shared/facade"

@Injectable({
    providedIn: "root"
})
export class StateAccessStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    mapColors$ = this.store.select(mapColorsSelector)
    isDeltaState$ = this.store.select(isDeltaStateSelector)
    areMultipleMapsVisible$ = this.store.select(areMultipleMapsVisibleSelector)

    getValue(): CcState {
        return this.state.getValue()
    }

    isLabelsPerMapActive(): boolean {
        return labelsPerMapActiveSelector(this.state.getValue())
    }

    resetSettings(keys: string[]) {
        const partialDefaultState = getPartialDefaultState(keys, this.state.getValue())
        if (partialDefaultState.mapState?.amountOfTopLabels !== undefined) {
            partialDefaultState.mapState.amountOfTopLabels = defaultAmountOfTopLabels
        }
        this.store.dispatch(setState({ value: partialDefaultState }))
    }
}
