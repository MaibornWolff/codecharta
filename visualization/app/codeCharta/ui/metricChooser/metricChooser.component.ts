import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core"
import { map, Observable } from "rxjs"
import { EdgeMetricData, NodeMetricData, CcState, PrimaryMetrics } from "../../codeCharta.model"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { attributeDescriptorsSelector } from "../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { Store } from "@ngrx/store"
import { MatSelect } from "@angular/material/select"
import { MatOption } from "@angular/material/core"

type MetricChooserType = "node" | "edge"

@Component({
    selector: "cc-metric-chooser",
    templateUrl: "./metricChooser.component.html",
    styleUrls: ["./metricChooser.component.scss"]
})
export class MetricChooserComponent implements OnInit, AfterViewInit {
    @Input() metricFor?: keyof PrimaryMetrics
    @Input() icon?: string
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

    @HostBinding("class.hide-metric-value")
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
        const matchingOptions = options
            .filter(option => option.value.toLowerCase().startsWith(this.searchTerm.toLowerCase()))
            .sort((a, b) => a.value.localeCompare(b.value))
        const searchTermExists = this.searchTerm.trim().length > 0

        setTimeout(() => {
            if (searchTermExists && selectedOptions.length === 0 && matchingOptions.length === 0) {
                this.matSelect._keyManager.setActiveItem(0)
            } else if (searchTermExists && selectedOptions.length === 0 && matchingOptions.length > 0) {
                this.matSelect._keyManager.setActiveItem(matchingOptions[0])
            }

            try {
                document.querySelector(".mdc-list-item--selected").scrollIntoView()
            } catch {
                // ignore
            }
        })
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

    handleKeyDown(event: KeyboardEvent) {
        const { key } = event
        if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Enter" && key !== "Escape") {
            event.stopPropagation()
        }
    }
}
