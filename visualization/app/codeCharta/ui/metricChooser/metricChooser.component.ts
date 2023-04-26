import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { map, Observable } from "rxjs"
import { EdgeMetricData, NodeMetricData, AttributeDescriptors } from "../../codeCharta.model"
import { metricTitles } from "../../util/metric/metricTitles"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

type MetricChooserType = "node" | "edge"

@Component({
	selector: "cc-metric-chooser",
	templateUrl: "./metricChooser.component.html",
	styleUrls: ["./metricChooser.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class MetricChooserComponent implements OnInit {
	@Input() selectedMetricName: string
	@Input() searchPlaceholder: string
	@Input() handleMetricChanged: (newSelectedMetricName: string) => void
	@Input() type: MetricChooserType = "node"
	@Input() isDisabled = false
	@ViewChild("searchTermInput") searchTermInput: ElementRef<HTMLInputElement>
	searchTerm = ""
	metricData$: Observable<NodeMetricData[] | EdgeMetricData[]>
	metricDataDescription: Map<string, string> = metricTitles
	attributeDescriptors$: Observable<AttributeDescriptors>
	attributeDescriptors: AttributeDescriptors

	constructor(private store: Store) {
		this.attributeDescriptors$ = store.select(attributeDescriptorsSelector)
	}

	ngOnInit(): void {
		this.metricData$ = this.store
			.select(metricDataSelector)
			.pipe(map(metricData => (this.type === "node" ? metricData.nodeMetricData : metricData.edgeMetricData)))
		this.attributeDescriptors$.subscribe(descriptions => (this.attributeDescriptors = descriptions))
	}

	handleOpenedChanged(opened: boolean) {
		if (opened) {
			this.searchTermInput.nativeElement.focus()
		} else {
			this.searchTerm = ""
		}
	}
}
