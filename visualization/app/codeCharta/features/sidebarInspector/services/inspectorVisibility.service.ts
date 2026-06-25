import { computed, inject, Injectable } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ThreeRendererService, ThreeSceneService } from "../../../features/codeMap/facade"
import { InspectorSelectedNodeStore } from "../stores/selectedNode.store"

@Injectable({ providedIn: "root" })
export class InspectorVisibilityService {
    private readonly selectedNodeStore = inject(InspectorSelectedNodeStore)
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly threeRendererService = inject(ThreeRendererService)

    private readonly selectedNode = toSignal(this.selectedNodeStore.selectedNode$, { initialValue: undefined })

    readonly isVisible = computed(() => this.selectedNode() != null)

    close() {
        this.threeSceneService.clearSelection()
        this.threeRendererService.render()
    }
}
