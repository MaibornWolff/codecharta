import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { ValueDistribution } from "../../../../util/metricRule/bucketValues"

interface DistributionBar {
    heightPercent: number
    matchedPercent: number
    tooltip: string
}

@Component({
    selector: "cc-metric-distribution",
    templateUrl: "./metricDistribution.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricDistributionComponent {
    readonly distribution = input.required<ValueDistribution>()
    readonly metric = input.required<string>()

    readonly bars = computed<DistributionBar[]>(() => {
        const { buckets } = this.distribution()
        const tallest = Math.max(...buckets.map(bucket => bucket.count), 1)
        return buckets.map(bucket => ({
            // A bucket that has files never renders as nothing: a long tail is the interesting end.
            heightPercent: bucket.count === 0 ? 0 : Math.max(6, Math.round((bucket.count / tallest) * 100)),
            matchedPercent: bucket.count === 0 ? 0 : Math.round((bucket.matchedCount / bucket.count) * 100),
            tooltip: `${formatBound(bucket.from)}–${formatBound(bucket.to)}: ${bucket.count} files, ${bucket.matchedCount} matched`
        }))
    })

    readonly hasBars = computed(() => this.distribution().buckets.length > 0)
    readonly minLabel = computed(() => formatBound(this.distribution().min))
    readonly maxLabel = computed(() => formatBound(this.distribution().max))
}

function formatBound(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
