import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../../codeCharta.model"

import { Metric } from "../../util/metric"
import { showAttributeTypeSelectorSelector } from "../../util/showAttributeTypeSelector.selector"

@Component({
    selector: "cc-attribute-side-bar-primary-metric",
    templateUrl: "./attributeSideBarPrimaryMetric.component.html",
    styleUrls: ["./attributeSideBarPrimaryMetric.component.scss"]
})
export class AttributeSideBarPrimaryMetricComponent {
    @Input() iconName: string
    @Input() metric: Metric
    @Input() metricLink: string
    showAttributeTypeSelector$: Observable<boolean>

    constructor(store: Store<CcState>) {
        this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
    }
}
