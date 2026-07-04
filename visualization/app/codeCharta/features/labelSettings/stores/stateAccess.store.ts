import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { defaultAmountOfTopLabels, mapColorsSelector } from "../../../mapState/mapState.read.facade"
import { isDeltaStateSelector } from "../../../fileStore/store/isDeltaState.selector"
import { areMultipleMapsVisibleSelector } from "../../../fileStore/store/areMultipleMapsVisible.selector"
import { labelsPerMapActiveSelector } from "../../../renderModel/renderModel.facade"
import { getPartialDefaultState } from "../../../store/getPartialDefaultState"
import { setState } from "../../../store/state.actions"

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
