import "./metricChooser.component.scss"
import {Component, ElementRef, Inject, Input, OnInit, ViewChild} from "@angular/core"
import {Store} from "../../state/angular-redux/store"
import {nodeMetricDataSelector} from "../../state/selectors/accumulatedData/metricData/nodeMetricData.selector"
import {Observable} from "rxjs"
import {EdgeMetricData, NodeMetricData} from "../../codeCharta.model"
import {edgeMetricDataSelector} from "../../state/selectors/accumulatedData/metricData/edgeMetricData.selector"
import {metricTitles} from "../../util/metric/metricTitles"

type MetricChooserType = "node" | "edge"

@Component({
	selector: "cc-metric-chooser",
	template: require("./metricChooser.component.html")
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

	constructor(@Inject(Store) private store: Store) {}

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
