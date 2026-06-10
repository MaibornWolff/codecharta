import { Injectable } from "@angular/core"
import { IsHeightAndColorMetricLinkedStore } from "../stores/isHeightAndColorMetricLinked.store"

@Injectable({
    providedIn: "root"
})
export class IsHeightAndColorMetricLinkedService {
    constructor(private readonly isHeightAndColorMetricLinkedStore: IsHeightAndColorMetricLinkedStore) {}

    isHeightAndColorMetricLinked$() {
        return this.isHeightAndColorMetricLinkedStore.isHeightAndColorMetricLinked$
    }

    toggleIsHeightAndColorMetricLinked() {
        this.isHeightAndColorMetricLinkedStore.toggleIsHeightAndColorMetricLinked()
    }
}
