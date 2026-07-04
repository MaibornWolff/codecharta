import { Injectable } from "@angular/core"
import { IsDeltaStateStore } from "../../shared/facade"

@Injectable({
    providedIn: "root"
})
export class IsDeltaStateService {
    constructor(private readonly isDeltaStateStore: IsDeltaStateStore) {}

    isDeltaState$() {
        return this.isDeltaStateStore.isDeltaState$
    }
}
