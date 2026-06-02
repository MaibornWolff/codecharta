import { Injectable } from "@angular/core"
import { VisibleNodeMetricValuesStore } from "../stores/visibleNodeMetricValues.store"

@Injectable({
    providedIn: "root"
})
export class VisibleNodeMetricValuesService {
    constructor(private readonly visibleNodeMetricValuesStore: VisibleNodeMetricValuesStore) {}

    visibleNodeMetricValues$() {
        return this.visibleNodeMetricValuesStore.visibleNodeMetricValues$
    }
}
