import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, inject } from "@angular/core"
import { CategorizedMetricDistribution } from "./selectors/fileExtensionCalculator"
import { DistributionMetricComponent } from "./distributionMetric/distributionMetric.component"
import { FileExtensionBarSegmentComponent } from "./fileExtensionBarSegment/fileExtensionBarSegment.component"
import { MetricDistributionService } from "./metricDistribution.service"

@Component({
    selector: "cc-file-extension-bar",
    templateUrl: "./fileExtensionBar.component.html",
    styleUrls: ["./fileExtensionBar.component.scss"],
    imports: [DistributionMetricComponent, FileExtensionBarSegmentComponent],
    host: {
        class: "fixed left-0 right-0 z-[70] block bg-base-100",
        "[style.bottom]": "'var(--cc-bottom-bar-height, 32px)'"
    }
})
export class FileExtensionBarComponent implements OnInit, AfterViewInit, OnDestroy {
    showAbsoluteValues = false
    metricDistribution: CategorizedMetricDistribution

    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private resizeObserver?: ResizeObserver

    constructor(private readonly metricDistributionService: MetricDistributionService) {}

    ngOnInit(): void {
        this.metricDistributionService.hoveredNodeMetricDistribution$.subscribe(metricDistribution => {
            this.metricDistribution = metricDistribution
        })
    }

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
        this.showAbsoluteValues = !this.showAbsoluteValues
    }
}
