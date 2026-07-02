import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { mapColorsSelector } from "../../../mapState/mapState.facade"
import { idToNodeSelector } from "../../../state/selectors/accumulatedData/idToNode.selector"
import { setSelectedBuildingId } from "../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.actions"

@Injectable({ providedIn: "root" })
export class ThreeSceneStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly mapColors$ = this.store.select(mapColorsSelector)

    getState(): CcState {
        return this.state.getValue()
    }

    getAppSettings() {
        return this.state.getValue().appSettings
    }

    getIdToNode() {
        return idToNodeSelector(this.state.getValue())
    }

    setSelectedBuildingId(value: number | null) {
        this.store.dispatch(setSelectedBuildingId({ value }))
    }
}
