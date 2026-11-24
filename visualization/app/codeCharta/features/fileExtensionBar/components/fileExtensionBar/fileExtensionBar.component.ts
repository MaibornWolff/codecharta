import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { OTHER_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { HEIGHT_CSS_VARIABLE, PublishesHeightDirective } from "../../../shared/facade"
import { MetricDistributionStore } from "../../stores/metricDistribution.store"
import { extensionsGroupedIntoOther } from "../../util/extensionsGroupedIntoOther"
import { DistributionMetricComponent } from "../distributionMetric/distributionMetric.component"
import { FileExtensionBarSegmentComponent } from "../fileExtensionBarSegment/fileExtensionBarSegment.component"

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
    readonly groupedIntoOther = computed(() => extensionsGroupedIntoOther(this.metricDistribution()))
    readonly otherExtension = OTHER_EXTENSION

    toggleShowAbsoluteValues() {
        this.showAbsoluteValues.update(value => !value)
    }
}
