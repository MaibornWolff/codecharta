import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { mapColorsSelector } from "../../../stores/mapState/mapState.read.facade"
import { setSelectedBuildingId } from "../../../stores/sharedView/sharedView.write.facade"
import { idToNodeSelector } from "../../renderModel/renderModel.facade"

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

    getPreferences() {
        return this.state.getValue().preferences
    }

    getMapState() {
        return this.state.getValue().mapState
    }

    getIdToNode() {
        return idToNodeSelector(this.state.getValue())
    }

    setSelectedBuildingId(value: string | null) {
        this.store.dispatch(setSelectedBuildingId({ value }))
    }
}
