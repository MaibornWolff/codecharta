import { Injectable, inject } from "@angular/core"
import { combineLatest, distinctUntilChanged, map } from "rxjs"
import { ActiveViewStore } from "../../../routing/activeView.store"
import { isThreeDimensionalLayoutSelector, MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { CcStateSnapshot } from "../../../stores/rootStore/ccState.snapshot"

@Injectable({ providedIn: "root" })
export class ThreeMapVisibilityStore {
    private readonly activeViewStore = inject(ActiveViewStore)
    private readonly ccStateSnapshot = inject(CcStateSnapshot)

    readonly isMapShown$ = combineLatest([this.activeViewStore.activeView$, inject(MapStateReadWindow).isThreeDimensionalLayout$]).pipe(
        map(([activeView, isThreeDimensionalLayout]) => activeView === "metrics" && isThreeDimensionalLayout),
        distinctUntilChanged()
    )

    isMapShown(): boolean {
        return this.activeViewStore.currentView() === "metrics" && isThreeDimensionalLayoutSelector(this.ccStateSnapshot.get())
    }
}
