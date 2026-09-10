import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { BlacklistType, MetricRuleOperator } from "../../../../model/codeCharta.model"
import { bucketValues } from "../../../../util/metricRule/bucketValues"
import { matchesMetricRule } from "../../../../util/metricRule/metricRuleMatcher"
import { EXPLORER_METRIC_RULES } from "../../explorerMetricRules.port"
import { MetricDistributionComponent } from "../metricDistribution/metricDistribution.component"

const BUCKET_COUNT = 24

interface OperatorOption {
    value: MetricRuleOperator
    label: string
}

const OPERATOR_OPTIONS: OperatorOption[] = [
    { value: "gt", label: "greater than" },
    { value: "gte", label: "at least" },
    { value: "lt", label: "less than" },
    { value: "lte", label: "at most" },
    { value: "eq", label: "equal to" },
    { value: "between", label: "between" }
]

@Component({
    selector: "cc-metric-rule-editor",
    templateUrl: "./metricRuleEditor.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MetricDistributionComponent]
})
export class MetricRuleEditorComponent {
    private readonly metricRules = inject(EXPLORER_METRIC_RULES)

    readonly type = input.required<BlacklistType>()
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly operatorOptions = OPERATOR_OPTIONS

    private readonly metricValues = toSignal(this.metricRules.metricValues$, { initialValue: new Map<string, number[]>() })

    readonly availableMetrics = computed(() => [...this.metricValues().keys()].sort((a, b) => a.localeCompare(b)))

    private readonly chosenMetric = signal<string | null>(null)
    readonly operator = signal<MetricRuleOperator>("gt")
    readonly value = signal(0)
    readonly upperValue = signal(0)

    readonly metric = computed(() => {
        const chosenMetric = this.chosenMetric()
        return chosenMetric !== null && this.metricValues().has(chosenMetric) ? chosenMetric : (this.availableMetrics()[0] ?? null)
    })
    readonly isRangeOperator = computed(() => this.operator() === "between")

    readonly title = computed(() => (this.type() === "flatten" ? "Flatten by metric" : "Exclude by metric"))
    readonly submitLabel = computed(() => (this.type() === "flatten" ? "Add flatten rule" : "Add exclude rule"))

    private readonly valuesOfMetric = computed(() => {
        const metric = this.metric()
        return metric === null ? [] : (this.metricValues().get(metric) ?? [])
    })

    private readonly condition = computed(() => ({ operator: this.operator(), value: this.value(), upperValue: this.upperValue() }))

    readonly distribution = computed(() =>
        bucketValues(this.valuesOfMetric(), BUCKET_COUNT, value => matchesMetricRule(this.condition(), value))
    )
    readonly fileCount = computed(() => this.valuesOfMetric().length)

    // Counted with the very predicate the decorator applies, so the number here is the number of
    // buildings that will actually change on the map.
    readonly matchCount = computed(() => this.valuesOfMetric().filter(value => matchesMetricRule(this.condition(), value)).length)

    readonly isSubmitDisabled = computed(() => this.metric() === null || this.matchCount() === 0)

    readonly popover = viewChild.required<ElementRef<HTMLElement>>("popover")

    setMetric(event: Event) {
        this.chosenMetric.set((event.target as HTMLSelectElement).value)
    }

    setOperator(event: Event) {
        this.operator.set((event.target as HTMLSelectElement).value as MetricRuleOperator)
    }

    setValue(event: Event) {
        this.value.set((event.target as HTMLInputElement).valueAsNumber)
    }

    setUpperValue(event: Event) {
        this.upperValue.set((event.target as HTMLInputElement).valueAsNumber)
    }

    addRule() {
        const metric = this.metric()
        if (metric === null || this.isSubmitDisabled()) {
            return
        }
        this.metricRules.addRule({
            metric,
            operator: this.operator(),
            value: this.value(),
            upperValue: this.isRangeOperator() ? this.upperValue() : undefined,
            type: this.type()
        })
        this.closePopover()
    }

    closePopover() {
        this.popover().nativeElement.hidePopover()
    }
}
