import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { histogramBins } from "../../util/histogramBins"

const BIN_COUNT = 12

@Component({
    selector: "cc-axis-distribution",
    templateUrl: "./axisDistribution.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex items-end gap-px h-6 w-full" }
})
export class AxisDistributionComponent {
    readonly values = input<readonly number[]>([])

    readonly heights = computed(() => histogramBins(this.values(), BIN_COUNT))
}
