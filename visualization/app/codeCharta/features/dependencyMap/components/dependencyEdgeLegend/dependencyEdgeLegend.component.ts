import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { isDependencyEdgeMetric } from "../../../../lenses/dependency/dependencyLens.facade"
import { DECLARATION_KIND_LEGEND, edgeLegend, USAGE_LEGEND } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"

@Component({
    selector: "cc-dependency-edge-legend",
    templateUrl: "./dependencyEdgeLegend.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex flex-col gap-3" }
})
export class DependencyEdgeLegendComponent {
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly edgeMetric = toSignal(this.readStore.sharedEdgeMetric$, { requireSync: true })
    private readonly settings = toSignal(this.readStore.persistedSettings$, { requireSync: true })
    private readonly hasDeclarations = toSignal(this.readStore.hasDeclarations$, { requireSync: true })

    readonly isDependencyMetric = computed(() => isDependencyEdgeMetric(this.edgeMetric()))
    /** Another edge metric has no cycles or upward edges: all its edges share the regular colour. */
    readonly edgeLegend = computed(() => {
        const [regularEdge, ...otherEdges] = edgeLegend(this.settings().edgeColors, this.settings().lineStyleShows)
        return this.isDependencyMetric() ? [regularEdge, ...otherEdges] : [{ ...regularEdge, label: this.edgeMetric() ?? "" }]
    })
    readonly usageLegend = computed(() =>
        this.isDependencyMetric() && this.hasDeclarations() && this.settings().lineStyleShows === "usage" ? USAGE_LEGEND : []
    )
    readonly kindMark = computed(() => this.settings().declarationKindMark)
    readonly kindLegend = computed(() => (this.hasDeclarations() && this.kindMark() !== "off" ? DECLARATION_KIND_LEGEND : []))
    readonly usageColor = computed(() => this.settings().edgeColors.regular)
}
