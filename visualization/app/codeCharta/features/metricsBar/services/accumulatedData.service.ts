import { Injectable } from "@angular/core"
import { AccumulatedDataStore } from "../stores/accumulatedData.store"

@Injectable({
    providedIn: "root"
})
export class AccumulatedDataService {
    constructor(private readonly accumulatedDataStore: AccumulatedDataStore) {}

    accumulatedData$() {
        return this.accumulatedDataStore.accumulatedData$
    }
}
