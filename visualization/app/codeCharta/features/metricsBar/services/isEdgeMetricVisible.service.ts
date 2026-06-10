import { Injectable } from "@angular/core"
import { IsEdgeMetricVisibleStore } from "../stores/isEdgeMetricVisible.store"

@Injectable({
    providedIn: "root"
})
export class IsEdgeMetricVisibleService {
    constructor(private readonly isEdgeMetricVisibleStore: IsEdgeMetricVisibleStore) {}

    isEdgeMetricVisible$() {
        return this.isEdgeMetricVisibleStore.isEdgeMetricVisible$
    }

    toggleEdgeMetricVisible() {
        this.isEdgeMetricVisibleStore.toggleEdgeMetricVisible()
    }
}
