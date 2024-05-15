import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState, CodeMapNode, Node, PrimaryMetrics } from "../../../codeCharta.model"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { NodeSelectionService } from "../nodeSelection.service"

@Component({
    selector: "cc-metric-chooser-value",
    templateUrl: "./metricChooserValue.component.html",
    encapsulation: ViewEncapsulation.None
})
export class MetricChooserValueComponent {
    @Input() metricFor: keyof PrimaryMetrics

    node$: Observable<CodeMapNode | Node>
    primaryMetricNames$: Observable<PrimaryMetrics>

    constructor(
        private nodeSelectionService: NodeSelectionService,
        private store: Store<CcState>
    ) {
        this.node$ = this.nodeSelectionService.createNodeObservable()
        this.primaryMetricNames$ = this.store.select(primaryMetricNamesSelector)
    }
}
