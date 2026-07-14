import { AsyncPipe } from "@angular/common"
import { ChangeDetectionStrategy, Component } from "@angular/core"
import { distributionMetric, MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"

@Component({
    selector: "cc-distribution-metric",
    templateUrl: "./distributionMetric.component.html",
    host: { class: "mx-[5px] flex min-w-max items-center gap-1.5 text-xs" },
    imports: [AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionMetricComponent {
    readonly areaMetric$ = this.mapStateReadWindow.areaMetric$
    readonly distributionMetric = distributionMetric

    constructor(private readonly mapStateReadWindow: MapStateReadWindow) {}
}
