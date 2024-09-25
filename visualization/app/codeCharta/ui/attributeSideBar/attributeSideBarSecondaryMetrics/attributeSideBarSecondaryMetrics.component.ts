import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { AttributeDescriptors, CcState } from "../../../codeCharta.model"

import { Metric } from "../util/metric"
import { showAttributeTypeSelectorSelector } from "../util/showAttributeTypeSelector.selector"
import { showDeltaValueSelector } from "../util/showDeltaValueSelector"
import { secondaryMetricsSelector } from "./secondaryMetrics.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

@Component({
    selector: "cc-attribute-side-bar-secondary-metrics",
    templateUrl: "./attributeSideBarSecondaryMetrics.component.html",
    styleUrls: ["../attributeSideBarMetrics.scss", "./attributeSideBarSecondaryMetrics.component.scss"]
})
export class AttributeSideBarSecondaryMetricsComponent {
    secondaryMetrics$: Observable<Metric[]>
    showAttributeTypeSelector$: Observable<boolean>
    showDeltaValue$: Observable<boolean>
    attributeDescriptors$: Observable<AttributeDescriptors>

    constructor(private store: Store<CcState>) {
        this.secondaryMetrics$ = this.store.select(secondaryMetricsSelector)
        this.showAttributeTypeSelector$ = this.store.select(showAttributeTypeSelectorSelector)
        this.showDeltaValue$ = this.store.select(showDeltaValueSelector)
        this.attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
    }
}
