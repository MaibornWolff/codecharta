import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core"
import { map, Observable } from "rxjs"
import { EdgeMetricData, NodeMetricData, CcState } from "../../codeCharta.model"
import { metricTitles } from "../../util/metric/metricTitles"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { Store } from "@ngrx/store"

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
	@Input() callback?: () => void
	@ViewChild("searchTermInput") searchTermInput: ElementRef<HTMLInputElement>
	searchTerm = ""
	metricData$: Observable<NodeMetricData[] | EdgeMetricData[]>
	metricDataDescription: Map<string, string> = metricTitles

	constructor(private store: Store<CcState>) {}

	ngOnInit(): void {
		this.metricData$ = this.store
			.select(metricDataSelector)
			.pipe(map(metricData => (this.type === "node" ? metricData.nodeMetricData : metricData.edgeMetricData)))
	}

	handleOpenedChanged(opened: boolean) {
		if (opened) {
			this.searchTermInput.nativeElement.focus()
		} else {
			this.searchTerm = ""
		}
	}

	matSelectChange() {
		if (this.callback) {
			this.callback()
		}
	}
}
