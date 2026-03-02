import { Injectable } from "@angular/core"
import { ShowMetricLabelNameValueStore } from "../stores/showMetricLabelNameValue.store"

@Injectable({
    providedIn: "root"
})
export class ShowMetricLabelNameValueService {
    constructor(private readonly showMetricLabelNameValueStore: ShowMetricLabelNameValueStore) {}

    showMetricLabelNameValue$() {
        return this.showMetricLabelNameValueStore.showMetricLabelNameValue$
    }

    setShowMetricLabelNameValue(value: boolean) {
        this.showMetricLabelNameValueStore.setShowMetricLabelNameValue(value)
    }
}
