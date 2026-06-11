import { computed, inject, Injectable } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../../ui/codeMap/threeViewer/threeSceneService"
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
