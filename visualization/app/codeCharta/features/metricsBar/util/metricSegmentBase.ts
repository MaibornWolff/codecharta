import { Signal, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { visibleNodeMetricValuesSelector } from "../../../state/selectors/visibleNodeMetricValues/visibleNodeMetricValues.selector"

/**
 * Shared base for the area and height metric segments. Both segments derive the
 * currently selected metric's values and min/max labels from
 * {@link visibleNodeMetricValuesSelector} and dispatch a metric-set action on
 * selection. Subclasses only provide the metric signal and the dispatch.
 */
export abstract class MetricSegmentBase {
    protected readonly store = inject(Store<CcState>)

    readonly visibleMetricValues = toSignal(this.store.select(visibleNodeMetricValuesSelector), { initialValue: {} })

    /** The metric name this segment is bound to (e.g. the area or height metric). */
    protected abstract readonly metric: Signal<string>

    readonly currentMetric = computed(() => this.visibleMetricValues()[this.metric()] ?? null)
    readonly values = computed(() => this.currentMetric()?.values ?? [])
    readonly minLabel = computed(() => this.currentMetric()?.minValue.toLocaleString() ?? "0")
    readonly maxLabel = computed(() => this.currentMetric()?.maxValue.toLocaleString() ?? "0")

    abstract handleMetricSelected(value: string): void
}
