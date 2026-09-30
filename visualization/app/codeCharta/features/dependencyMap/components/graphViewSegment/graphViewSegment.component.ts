import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"

@Component({
    selector: "cc-graph-view-segment",
    templateUrl: "./graphViewSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex flex-col items-stretch justify-center gap-1 px-2 py-1" }
})
export class GraphViewSegmentComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly viewStore = inject(DependencyMapViewStore)

    readonly isFocused = toSignal(inject(DependencyMapReadStore).isFocused$, { requireSync: true })
    readonly hasMovedBoxes = computed(() => this.viewStore.boxOffsets().size > 0)

    showWholeGraph(): void {
        this.viewStore.requestFit()
    }

    resetLayout(): void {
        this.viewStore.resetLayout()
    }

    unfocus(): void {
        this.writeStore.unfocusAll()
    }
}
