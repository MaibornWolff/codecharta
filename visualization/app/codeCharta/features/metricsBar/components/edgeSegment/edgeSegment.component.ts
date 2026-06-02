import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { isEdgeMetricVisibleSelector } from "../../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { setEdgeMetric } from "../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { edgeMetricSelector } from "../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { AxisCardComponent } from "../axisCard/axisCard.component"
import { EdgeSettingsPopoverComponent } from "../edgeSettingsPopover/edgeSettingsPopover.component"
import { MetricSelectPopoverComponent } from "../metricSelectPopover/metricSelectPopover.component"

@Component({
    selector: "cc-edge-segment",
    templateUrl: "./edgeSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, MetricSelectPopoverComponent, EdgeSettingsPopoverComponent]
})
export class EdgeSegmentComponent {
    private readonly store = inject(Store<CcState>)
    private readonly nodeSelectionService = inject(NodeSelectionService)

    readonly searchPopoverId = "metric-select-popover-edge"
    readonly searchAnchorName = "metric-segment-edges"
    readonly settingsPopoverId = "metric-settings-popover-edge"
    readonly settingsAnchorName = "metric-segment-edges-cog"

    readonly edgeMetric = toSignal(this.store.select(edgeMetricSelector), { initialValue: "" })
    readonly isEdgeMetricVisible = toSignal(this.store.select(isEdgeMetricVisibleSelector), { initialValue: true })
    readonly hoveredNode = toSignal(this.nodeSelectionService.createNodeObservable())

    readonly hoveredEdgeValue = computed(() => {
        const node = this.hoveredNode()
        const metric = this.edgeMetric()
        if (!node || !metric) {
            return null
        }
        const edgeValues = node.edgeAttributes?.[metric]
        if (!edgeValues) {
            return null
        }
        return `${formatValue(edgeValues.incoming)} / ${formatValue(edgeValues.outgoing)}`
    })

    handleMetricSelected(value: string) {
        this.store.dispatch(setEdgeMetric({ value }))
    }
}

function formatValue(value?: number): string {
    return typeof value === "number" ? value.toLocaleString() : "-"
}
