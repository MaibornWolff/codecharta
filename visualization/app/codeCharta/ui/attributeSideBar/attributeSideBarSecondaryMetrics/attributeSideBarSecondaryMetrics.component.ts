import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { AttributeDescriptors, CcState } from "../../../codeCharta.model"

import { Metric } from "../util/metric"
import { showAttributeTypeSelectorSelector } from "../util/showAttributeTypeSelector.selector"
import { showDeltaValueSelector } from "../util/showDeltaValueSelector"
import { secondaryMetricsSelector } from "./secondaryMetrics.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { AttributeTypeSelectorComponent } from "../attributeTypeSelector/attributeTypeSelector.component"
import { MetricDeltaSelectedComponent } from "../metricDeltaSelected/metricDeltaSelected.component"
import { AsyncPipe, DecimalPipe } from "@angular/common"
import { AttributeDescriptorTooltipPipe } from "../../../util/pipes/attributeDescriptorTooltip.pipe"

@Component({
    selector: "cc-attribute-side-bar-secondary-metrics",
    templateUrl: "./attributeSideBarSecondaryMetrics.component.html",
    styleUrls: ["../attributeSideBarMetrics.scss", "./attributeSideBarSecondaryMetrics.component.scss"],
    standalone: true,
    imports: [AttributeTypeSelectorComponent, MetricDeltaSelectedComponent, AsyncPipe, DecimalPipe, AttributeDescriptorTooltipPipe]
})
export class AttributeSideBarSecondaryMetricsComponent {
    secondaryMetrics$: Observable<Metric[]>
    showAttributeTypeSelector$: Observable<boolean>
    showDeltaValue$: Observable<boolean>
    attributeDescriptors$: Observable<AttributeDescriptors>

    constructor(private readonly store: Store<CcState>) {
        this.secondaryMetrics$ = this.store.select(secondaryMetricsSelector)
        this.showAttributeTypeSelector$ = this.store.select(showAttributeTypeSelectorSelector)
        this.showDeltaValue$ = this.store.select(showDeltaValueSelector)
        this.attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
    }
}
