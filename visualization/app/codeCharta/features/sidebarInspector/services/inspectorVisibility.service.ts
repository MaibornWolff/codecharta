import { computed, Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ThreeRendererService, ThreeSceneService } from "../../../renderer/threeViewer/threeViewer.facade"
import { SidebarInspectorReadStore } from "../stores/sidebarInspector.read.store"

@Injectable({ providedIn: "root" })
export class InspectorVisibilityService {
    private readonly readStore = inject(SidebarInspectorReadStore)
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly threeRendererService = inject(ThreeRendererService)

    private readonly selectedNode = toSignal(this.readStore.selectedNode$, { initialValue: undefined })

    readonly isVisible = computed(() => this.selectedNode() != null)

    close() {
        this.threeSceneService.clearSelection()
        this.threeRendererService.render()
    }
}
