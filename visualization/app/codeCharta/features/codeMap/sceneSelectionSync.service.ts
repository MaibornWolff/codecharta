import { Injectable, inject, OnDestroy } from "@angular/core"
import { combineLatest, filter, map, Observable, Subscription } from "rxjs"
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
        this.subscription = this.whileTheMapIsShown(this.sharedViewReadWindow.selectedNodePath$).subscribe(selectedNodePath =>
            this.showOnTheMap(selectedNodePath)
        )
        this.subscription.add(
            this.whileTheMapIsShown(this.sharedViewReadWindow.keptHighlightPaths$).subscribe(paths =>
                this.threeSceneService.showKeptHighlight(paths)
            )
        )
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe()
    }

    private whileTheMapIsShown<T>(value$: Observable<T>): Observable<T> {
        return combineLatest([value$, this.threeMapVisibilityStore.isMapShown$]).pipe(
            filter(([, isMapShown]) => isMapShown),
            map(([value]) => value)
        )
    }

    private showOnTheMap(selectedNodePath: string | null): void {
        const selectedBefore = this.threeSceneService.getSelectedBuilding()
        this.threeSceneService.showSelection(selectedNodePath)
        const selectedNow = this.threeSceneService.getSelectedBuilding()
        if (selectedNow === selectedBefore) {
            return
        }
        this.codeMapMouseEventService.drawLabelSelectedBuilding(selectedNow)
        this.threeRendererService.render()
    }
}
