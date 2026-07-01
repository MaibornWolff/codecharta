import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { defaultAmountOfTopLabels, mapColorsSelector } from "../../../appearance/appearance.facade"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { areMultipleMapsVisibleSelector } from "../../../state/selectors/areMultipleMapsVisible.selector"
import { labelsPerMapActiveSelector } from "../../../state/selectors/labelsPerMapActive.selector"
import { getPartialDefaultState } from "../../../state/store/util/getPartialDefaultState"
import { setState } from "../../../state/store/state.actions"

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
        if (partialDefaultState.appSettings?.amountOfTopLabels !== undefined) {
            partialDefaultState.appSettings.amountOfTopLabels = defaultAmountOfTopLabels
        }
        this.store.dispatch(setState({ value: partialDefaultState }))
    }
}
