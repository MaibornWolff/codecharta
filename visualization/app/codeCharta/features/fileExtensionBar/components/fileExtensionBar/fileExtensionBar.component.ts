import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MetricDistribution, OTHER_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { HEIGHT_CSS_VARIABLE, PublishesHeightDirective } from "../../../shared/facade"
import { MetricDistributionStore } from "../../stores/metricDistribution.store"
import { extensionsGroupedIntoOther } from "../../util/extensionsGroupedIntoOther"
import { DistributionMetricComponent } from "../distributionMetric/distributionMetric.component"
import { FileExtensionBarSegmentComponent } from "../fileExtensionBarSegment/fileExtensionBarSegment.component"

const NOTHING_GROUPED: MetricDistribution[] = []

@Component({
    selector: "cc-file-extension-bar",
    templateUrl: "./fileExtensionBar.component.html",
    imports: [DistributionMetricComponent, FileExtensionBarSegmentComponent],
    host: {
        class: "fixed left-0 right-0 z-[70] block bg-base-100",
        "[style.bottom]": "'var(--cc-bottom-bar-height, 32px)'"
    },
    hostDirectives: [PublishesHeightDirective],
    providers: [{ provide: HEIGHT_CSS_VARIABLE, useValue: "--cc-file-extension-bar-height" }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionBarComponent {
    private readonly metricDistributionStore = inject(MetricDistributionStore)

    readonly showAbsoluteValues = signal(false)
    readonly metricDistribution = toSignal(this.metricDistributionStore.hoveredNodeMetricDistribution$, { requireSync: true })
    readonly segments = computed(() => {
        const distribution = this.metricDistribution()
        const groupedIntoOther = extensionsGroupedIntoOther(distribution)
        return distribution.visible.map(item => ({
            item,
            groupedItems: item.fileExtension === OTHER_EXTENSION ? groupedIntoOther : NOTHING_GROUPED
        }))
    })

    toggleShowAbsoluteValues() {
        this.showAbsoluteValues.update(value => !value)
    }
}
