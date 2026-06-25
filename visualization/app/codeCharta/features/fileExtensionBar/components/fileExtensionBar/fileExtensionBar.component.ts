import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DistributionMetricComponent } from "../distributionMetric/distributionMetric.component"
import { FileExtensionBarSegmentComponent } from "../fileExtensionBarSegment/fileExtensionBarSegment.component"
import { MetricDistributionService } from "../../services/metricDistribution.service"

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
    private readonly metricDistributionService = inject(MetricDistributionService)
    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private resizeObserver?: ResizeObserver

    readonly showAbsoluteValues = signal(false)
    readonly metricDistribution = toSignal(this.metricDistributionService.hoveredNodeMetricDistribution$, { requireSync: true })

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
