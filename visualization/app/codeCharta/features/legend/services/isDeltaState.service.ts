import { Injectable } from "@angular/core"
import { LegendIsDeltaStateStore } from "../stores/isDeltaState.store"

@Injectable({
    providedIn: "root"
})
export class LegendIsDeltaStateService {
    constructor(private readonly isDeltaStateStore: LegendIsDeltaStateStore) {}

    isDeltaState$() {
        return this.isDeltaStateStore.isDeltaState$
    }
}
