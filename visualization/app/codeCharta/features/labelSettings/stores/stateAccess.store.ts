import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { getPartialDefaultState } from "../../../ui/resetSettingsButton/getPartialDefaultState"
import { setState } from "../../../state/store/state.actions"
import { defaultAmountOfTopLabels } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.reducer"

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

    getValue(): CcState {
        return this.state.getValue()
    }

    resetSettings(keys: string[]) {
        const partialDefaultState = getPartialDefaultState(keys, this.state.getValue())
        if (partialDefaultState.appSettings?.amountOfTopLabels !== undefined) {
            partialDefaultState.appSettings.amountOfTopLabels = defaultAmountOfTopLabels
        }
        this.store.dispatch(setState({ value: partialDefaultState }))
    }
}
