import { Injectable } from "@angular/core"
import { IsDeltaStateStore } from "../stores/isDeltaState.store"

@Injectable({
    providedIn: "root"
})
export class IsDeltaStateService {
    constructor(private readonly isDeltaStateStore: IsDeltaStateStore) {}

    isDeltaState$() {
        return this.isDeltaStateStore.isDeltaState$
    }
}
