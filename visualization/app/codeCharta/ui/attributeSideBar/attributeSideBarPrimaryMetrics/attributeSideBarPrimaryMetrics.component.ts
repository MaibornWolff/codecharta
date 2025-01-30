import { Component } from "@angular/core"
import { Observable } from "rxjs"

import { showAttributeTypeSelectorSelector } from "../util/showAttributeTypeSelector.selector"
import { PrimaryMetrics, primaryMetricsSelector } from "../../../state/selectors/primaryMetrics/primaryMetrics.selector"
import { Store } from "@ngrx/store"
import { AttributeDescriptors, CcState } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { AttributeSideBarPrimaryMetricComponent } from "./attributeSideBarPrimaryMetric/attributeSideBarPrimaryMetric.component"
import { AttributeTypeSelectorComponent } from "../attributeTypeSelector/attributeTypeSelector.component"
import { AsyncPipe, DecimalPipe } from "@angular/common"
import { AttributeDescriptorTooltipPipe } from "../../../util/pipes/attributeDescriptorTooltip.pipe"

@Component({
    selector: "cc-attribute-side-bar-primary-metrics",
    templateUrl: "./attributeSideBarPrimaryMetrics.component.html",
    styleUrls: ["./../attributeSideBarMetrics.scss"],
    standalone: true,
    imports: [
        AttributeSideBarPrimaryMetricComponent,
        AttributeTypeSelectorComponent,
        AsyncPipe,
        DecimalPipe,
        AttributeDescriptorTooltipPipe
    ]
})
export class AttributeSideBarPrimaryMetricsComponent {
    primaryMetrics$: Observable<PrimaryMetrics>
    showAttributeTypeSelector$: Observable<boolean>
    attributeDescriptors$: Observable<AttributeDescriptors>

    constructor(private readonly store: Store<CcState>) {
        this.primaryMetrics$ = this.store.select(primaryMetricsSelector)
        this.showAttributeTypeSelector$ = this.store.select(showAttributeTypeSelectorSelector)
        this.attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
    }
}
