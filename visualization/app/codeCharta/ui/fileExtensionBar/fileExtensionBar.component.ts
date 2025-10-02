import { Component, OnInit } from "@angular/core"
import { CategorizedMetricDistribution } from "./selectors/fileExtensionCalculator"
import { DistributionMetricComponent } from "./distributionMetric/distributionMetric.component"
import { FileExtensionBarSegmentComponent } from "./fileExtensionBarSegment/fileExtensionBarSegment.component"
import { MetricDistributionService } from "./metricDistribution.service"

@Component({
    selector: "cc-file-extension-bar",
    templateUrl: "./fileExtensionBar.component.html",
    styleUrls: ["./fileExtensionBar.component.scss"],
    standalone: true,
    imports: [DistributionMetricComponent, FileExtensionBarSegmentComponent]
})
export class FileExtensionBarComponent implements OnInit {
    showAbsoluteValues = false
    metricDistribution: CategorizedMetricDistribution

    constructor(private readonly metricDistributionService: MetricDistributionService) {}

    ngOnInit(): void {
        this.metricDistributionService.hoveredNodeMetricDistribution$.subscribe(metricDistribution => {
            this.metricDistribution = metricDistribution
        })
    }

    toggleShowAbsoluteValues() {
        this.showAbsoluteValues = !this.showAbsoluteValues
    }
}
