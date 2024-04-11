import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core"
import { map, Observable } from "rxjs"
import { EdgeMetricData, NodeMetricData, CcState } from "../../codeCharta.model"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { Store } from "@ngrx/store"
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"

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
	@ViewChild("matSelect") matSelect: MatSelect
	@ViewChildren(MatOption) matOptions: QueryList<MatOption>
	searchTerm = ""
	metricData$: Observable<NodeMetricData[] | EdgeMetricData[]>
	attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
	hideMetricSum = false

	constructor(private store: Store<CcState>) {}

	ngOnInit(): void {
		this.metricData$ = this.store
			.select(metricDataSelector)
			.pipe(map(metricData => (this.type === "node" ? metricData.nodeMetricData : metricData.edgeMetricData)))
	}

	ngAfterViewInit() {
		this.matOptions.changes.subscribe((options: QueryList<MatOption>) => {
			this.setFirstItemActiveOnSearch(options)
		})
	}

	setFirstItemActiveOnSearch(options: QueryList<MatOption>) {
		const selectedOptions = options.filter(option => option["_selected"])
		const matchingOptions = options.filter(option => option.value.toLowerCase().startsWith(this.searchTerm.toLowerCase()))
		const searchTermExists = this.searchTerm.trim().length > 0

		if (searchTermExists && selectedOptions.length === 0 && matchingOptions.length === 0) {
			setTimeout(() => this.matSelect._keyManager.setActiveItem(0))
		}
	}

	handleOpenedChanged(opened: boolean) {
		if (opened) {
			this.searchTermInput.nativeElement.focus()
			this.hideMetricSum = true
		} else {
			this.searchTerm = ""
			this.hideMetricSum = false
		}
	}
}
