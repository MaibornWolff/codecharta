import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState } from "../../../../codeCharta.model"

import { Metric } from "../../util/metric"
import { showAttributeTypeSelectorSelector } from "../../util/showAttributeTypeSelector.selector"
import { AttributeTypeSelectorComponent } from "../../attributeTypeSelector/attributeTypeSelector.component"
import { MetricDeltaSelectedComponent } from "../../metricDeltaSelected/metricDeltaSelected.component"
import { AsyncPipe, DecimalPipe } from "@angular/common"

@Component({
    selector: "cc-attribute-side-bar-primary-metric",
    templateUrl: "./attributeSideBarPrimaryMetric.component.html",
    styleUrls: ["./attributeSideBarPrimaryMetric.component.scss"],
    standalone: true,
    imports: [AttributeTypeSelectorComponent, MetricDeltaSelectedComponent, AsyncPipe, DecimalPipe]
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
