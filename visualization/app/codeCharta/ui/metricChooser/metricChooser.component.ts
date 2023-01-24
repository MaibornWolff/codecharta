import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { nodeMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/nodeMetricData.selector"
import { Observable } from "rxjs"
import { EdgeMetricData, NodeMetricData } from "../../codeCharta.model"
import { edgeMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/edgeMetricData.selector"
import { metricTitles } from "../../util/metric/metricTitles"

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
	metricDataDescription$: Map<string, string>

	constructor(private store: Store) {}

	ngOnInit(): void {
		this.metricData$ = this.store.select(this.type === "node" ? nodeMetricDataSelector : edgeMetricDataSelector)
		this.metricDataDescription$ = metricTitles
	}

	handleOpenedChanged(opened: boolean) {
		if (opened) {
			this.searchTermInput.nativeElement.focus()
		} else {
			this.searchTerm = ""
		}
	}
}
