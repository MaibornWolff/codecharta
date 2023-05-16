import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from "@angular/core"
import { map, Observable, Subscription } from "rxjs"
import { EdgeMetricData, NodeMetricData, AttributeDescriptors, CcState } from "../../codeCharta.model"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { Store } from "@ngrx/store"

type MetricChooserType = "node" | "edge"

@Component({
	selector: "cc-metric-chooser",
	templateUrl: "./metricChooser.component.html",
	styleUrls: ["./metricChooser.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class MetricChooserComponent implements OnInit, OnDestroy {
	@Input() selectedMetricName: string
	@Input() searchPlaceholder: string
	@Input() handleMetricChanged: (newSelectedMetricName: string) => void
	@Input() type: MetricChooserType = "node"
	@Input() isDisabled = false
	@ViewChild("searchTermInput") searchTermInput: ElementRef<HTMLInputElement>
	searchTerm = ""
	metricData$: Observable<NodeMetricData[] | EdgeMetricData[]>
	attributeDescriptors$: Observable<AttributeDescriptors>
	attributeDescriptors: AttributeDescriptors
	descriptorSubscription: Subscription

	constructor(private store: Store<CcState>) {
		this.attributeDescriptors$ = store.select(attributeDescriptorsSelector)
	}

	ngOnInit(): void {
		this.metricData$ = this.store
			.select(metricDataSelector)
			.pipe(map(metricData => (this.type === "node" ? metricData.nodeMetricData : metricData.edgeMetricData)))
		this.descriptorSubscription = this.attributeDescriptors$.subscribe(descriptions => (this.attributeDescriptors = descriptions))
	}

	handleOpenedChanged(opened: boolean) {
		if (opened) {
			this.searchTermInput.nativeElement.focus()
		} else {
			this.searchTerm = ""
		}
	}

	ngOnDestroy(): void {
		this.descriptorSubscription.unsubscribe()
	}
}
