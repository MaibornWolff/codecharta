import { Component, Input, OnDestroy, ViewEncapsulation } from "@angular/core"
import { AttributeDescriptors, CcState } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { Store } from "@ngrx/store"
import { metricTitles } from "../../../util/metric/metricTitles"
import { Subscription } from "rxjs"

@Component({
	selector: "cc-legend-block",
	templateUrl: "./legendBlock.component.html",
	encapsulation: ViewEncapsulation.None
})
export class LegendBlockComponent implements OnDestroy {
	@Input() metricName: string
	attributeDescriptors: AttributeDescriptors
	fallbackTitles: Map<string, string> = metricTitles
	descriptionSubscription: Subscription

	constructor(private store: Store<CcState>) {
		this.descriptionSubscription = this.store
			.select(attributeDescriptorsSelector)
			.subscribe(descriptors => (this.attributeDescriptors = descriptors))
	}

	ngOnDestroy(): void {
		this.descriptionSubscription.unsubscribe()
	}
}
