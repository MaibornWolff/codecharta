import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CcState, CodeMapNode, Node, PrimaryMetrics } from "../../../codeCharta.model"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { NodeSelectionService } from "../nodeSelection.service"

@Component({
    selector: "cc-metric-chooser-value",
    templateUrl: "./metricChooserValue.component.html",
    styleUrl: "./metricChooserValue.component.scss"
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

    calculateBackgroundColor(delta: number): string {
        if (this.metricFor === "heightMetric" && delta > 0) {
            return "#b1d8a8"
        }

        if (delta < 0) {
            return "#ffcccc"
        }

        return "#e6e6e6"
    }
}
