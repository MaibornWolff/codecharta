import { ChangeDetectionStrategy, Component } from "@angular/core"
import { AsyncPipe } from "@angular/common"
import { distributionMetric } from "../../../../state/store/dynamicSettings/distributionMetric/distributionMetric.reducer"
import { DistributionMetricService } from "../../services/distributionMetric.service"

@Component({
    selector: "cc-distribution-metric",
    templateUrl: "./distributionMetric.component.html",
    host: { class: "mx-[5px] flex min-w-max items-center gap-1.5 text-xs" },
    imports: [AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionMetricComponent {
    readonly areaMetric$ = this.distributionMetricService.areaMetric$
    readonly distributionMetric = distributionMetric

    constructor(private readonly distributionMetricService: DistributionMetricService) {}
}
