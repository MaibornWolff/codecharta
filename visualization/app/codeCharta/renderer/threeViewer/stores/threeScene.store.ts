import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { MapStateReadWindow, mapColorsSelector } from "../../../stores/mapState/mapState.read.facade"
import { PreferencesReadWindow } from "../../../stores/preferences/preferences.read.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { setSelectedBuildingId } from "../../../stores/sharedView/sharedView.write.facade"
import { idToNodeSelector } from "../../renderModel/renderModel.facade"

@Injectable({ providedIn: "root" })
export class ThreeSceneStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly ccStateSnapshot: CcStateSnapshot,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly preferencesReadWindow: PreferencesReadWindow
    ) {}

    readonly mapColors$ = this.store.select(mapColorsSelector)

    getState(): CcState {
        return this.ccStateSnapshot.get()
    }

    getPreferences() {
        return this.preferencesReadWindow.getPreferences()
    }

    getMapState() {
        return this.mapStateReadWindow.getMapState()
    }

    getIdToNode() {
        return idToNodeSelector(this.ccStateSnapshot.get())
    }

    setSelectedBuildingId(value: string | null) {
        this.store.dispatch(setSelectedBuildingId({ value }))
    }
}
