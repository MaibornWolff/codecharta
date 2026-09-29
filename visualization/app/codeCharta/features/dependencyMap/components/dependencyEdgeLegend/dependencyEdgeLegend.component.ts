import { ChangeDetectionStrategy, Component } from "@angular/core"
import { EDGE_LEGEND } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"

@Component({
    selector: "cc-dependency-edge-legend",
    templateUrl: "./dependencyEdgeLegend.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class DependencyEdgeLegendComponent {
    readonly edgeLegend = EDGE_LEGEND
}
