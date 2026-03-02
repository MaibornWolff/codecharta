import { Injectable } from "@angular/core"
import { ShowMetricLabelNodeNameStore } from "../stores/showMetricLabelNodeName.store"

@Injectable({
    providedIn: "root"
})
export class ShowMetricLabelNodeNameService {
    constructor(private readonly showMetricLabelNodeNameStore: ShowMetricLabelNodeNameStore) {}

    showMetricLabelNodeName$() {
        return this.showMetricLabelNodeNameStore.showMetricLabelNodeName$
    }

    setShowMetricLabelNodeName(value: boolean) {
        this.showMetricLabelNodeNameStore.setShowMetricLabelNodeName(value)
    }
}
