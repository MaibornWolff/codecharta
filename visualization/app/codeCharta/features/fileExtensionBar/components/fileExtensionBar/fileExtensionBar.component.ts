import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MetricDistributionStore } from "../../stores/metricDistribution.store"
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExtensionBarComponent implements AfterViewInit, OnDestroy {
    private readonly metricDistributionStore = inject(MetricDistributionStore)
    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private resizeObserver?: ResizeObserver

    readonly showAbsoluteValues = signal(false)
    readonly metricDistribution = toSignal(this.metricDistributionStore.hoveredNodeMetricDistribution$, { requireSync: true })

    ngAfterViewInit(): void {
        const host = this.elementReference.nativeElement as HTMLElement
        const updateHeight = () => {
            const height = host.getBoundingClientRect().height
            document.documentElement.style.setProperty("--cc-file-extension-bar-height", `${Math.round(height)}px`)
        }
        updateHeight()
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(updateHeight)
            this.resizeObserver.observe(host)
        }
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect()
        document.documentElement.style.removeProperty("--cc-file-extension-bar-height")
    }

    toggleShowAbsoluteValues() {
        this.showAbsoluteValues.update(value => !value)
    }
}
