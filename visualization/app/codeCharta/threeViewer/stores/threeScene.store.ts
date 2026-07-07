import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { mapColorsSelector } from "../../mapState/mapState.read.facade"
import { idToNodeSelector } from "../../renderModel/renderModel.facade"
import { setSelectedBuildingId } from "../../sharedView/sharedView.write.facade"

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
