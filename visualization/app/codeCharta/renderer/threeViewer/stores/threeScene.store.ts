import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { MapStateReadWindow, mapColorsSelector } from "../../../stores/mapState/mapState.read.facade"
import { PreferencesReadWindow } from "../../../stores/preferences/preferences.read.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"
import { keptHighlightPathsSelector, selectedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { NodeInteraction } from "../../../stores/sharedView/sharedView.write.facade"

@Injectable({ providedIn: "root" })
export class ThreeSceneStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly ccStateSnapshot: CcStateSnapshot,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly preferencesReadWindow: PreferencesReadWindow,
        private readonly nodeInteraction: NodeInteraction
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

    getKeptHighlightPaths(): readonly string[] {
        return keptHighlightPathsSelector(this.ccStateSnapshot.get())
    }

    getSelectedNodePath(): string | null {
        return selectedNodePathSelector(this.ccStateSnapshot.get())
    }

    selectNode(path: string) {
        this.nodeInteraction.selectNode(path)
    }

    clearNodeSelection() {
        this.nodeInteraction.clearSelection()
    }
}
