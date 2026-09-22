import { Injectable, inject, OnDestroy } from "@angular/core"
import { combineLatest, filter, map, Subscription } from "rxjs"
import { ThreeMapVisibilityStore, ThreeRendererService, ThreeSceneService } from "../../renderer/threeViewer/threeViewer.facade"
import { SharedViewReadWindow } from "../../stores/sharedView/sharedView.read.facade"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"

@Injectable({ providedIn: "root" })
export class SceneSelectionSyncService implements OnDestroy {
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly threeRendererService = inject(ThreeRendererService)
    private readonly codeMapMouseEventService = inject(CodeMapMouseEventService)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly threeMapVisibilityStore = inject(ThreeMapVisibilityStore)
    private subscription?: Subscription

    start(): void {
        this.subscription?.unsubscribe()
        this.subscription = combineLatest([this.sharedViewReadWindow.selectedNodePath$, this.threeMapVisibilityStore.isMapShown$])
            .pipe(
                filter(([, isMapShown]) => isMapShown),
                map(([selectedNodePath]) => selectedNodePath)
            )
            .subscribe(selectedNodePath => this.showOnTheMap(selectedNodePath))
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe()
    }

    private showOnTheMap(selectedNodePath: string | null): void {
        const selectedBefore = this.threeSceneService.getSelectedBuilding()
        this.threeSceneService.showSelection(selectedNodePath)
        const selectedNow = this.threeSceneService.getSelectedBuilding()
        if (selectedNow === selectedBefore) {
            return
        }
        this.codeMapMouseEventService.drawLabelSelectedBuilding(selectedNow)
        this.threeSceneService.clearConstantHighlight()
        this.threeRendererService.render()
    }
}
