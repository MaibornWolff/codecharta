import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { isDependencyEdgeMetric } from "../../../../lenses/dependency/dependencyLens.facade"
import { EDGE_LEGEND } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"

const [REGULAR_EDGE] = EDGE_LEGEND

@Component({
    selector: "cc-dependency-edge-legend",
    templateUrl: "./dependencyEdgeLegend.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class DependencyEdgeLegendComponent {
    private readonly edgeMetric = toSignal(inject(DependencyMapReadStore).edgeMetric$, { requireSync: true })

    readonly isDependencyMetric = computed(() => isDependencyEdgeMetric(this.edgeMetric()))
    /** Another edge metric has no cycles or upward edges: all its edges share the regular colour. */
    readonly edgeLegend = computed(() => (this.isDependencyMetric() ? EDGE_LEGEND : [{ ...REGULAR_EDGE, label: this.edgeMetric() ?? "" }]))
}
