import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyEdgeType, edgeTypesCarriedBy } from "../../../../lenses/dependency/dependencyLens.facade"
import { EDGE_LEGEND } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { AxisCardComponent, SelectionShortcutsComponent, SettingsPopoverShellComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { invertedEdgeTypes, nameOfShownEdgeTypes, withAllEdgeTypes, withoutEdgeTypes } from "./shownEdgeTypes"

/** The edge types the graph draws, one toggle per edge colour; the edge metric decides which of them it carries. */
@Component({
    selector: "cc-edge-types-segment",
    templateUrl: "./edgeTypesSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, SettingsPopoverShellComponent, SelectionShortcutsComponent]
})
export class EdgeTypesSegmentComponent {
    private readonly viewStore = inject(DependencyMapViewStore)
    private readonly edgeMetric = toSignal(inject(DependencyMapReadStore).edgeMetric$, { requireSync: true })

    readonly popoverId = "dependency-bar-edges-popover"
    readonly anchorName = "dependency-bar-edges-card"

    private readonly carriedTypes = computed(() => edgeTypesCarriedBy(this.edgeMetric()))
    private readonly shownTypes = this.viewStore.shownEdgeTypes

    readonly entries = computed(() =>
        EDGE_LEGEND.map(entry => {
            const isCarried = this.carriedTypes().includes(entry.type)
            return { ...entry, isCarried, isShown: isCarried && this.shownTypes().includes(entry.type) }
        })
    )
    readonly chosenLabel = computed(() => nameOfShownEdgeTypes(this.shownTypes(), this.carriedTypes()))

    toggle(type: DependencyEdgeType, isShown: boolean): void {
        this.viewStore.showEdgeTypes(isShown ? withAllEdgeTypes(this.shownTypes(), [type]) : withoutEdgeTypes(this.shownTypes(), [type]))
    }

    showAll(): void {
        this.viewStore.showEdgeTypes(withAllEdgeTypes(this.shownTypes(), this.carriedTypes()))
    }

    showNone(): void {
        this.viewStore.showEdgeTypes(withoutEdgeTypes(this.shownTypes(), this.carriedTypes()))
    }

    invert(): void {
        this.viewStore.showEdgeTypes(invertedEdgeTypes(this.shownTypes(), this.carriedTypes()))
    }
}
