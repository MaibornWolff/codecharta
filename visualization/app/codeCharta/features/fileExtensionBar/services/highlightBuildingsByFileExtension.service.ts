import { Injectable } from "@angular/core"
import { distinct, filter } from "rxjs"
import { ThreeSceneService } from "../../../renderer/threeViewer/threeViewer.facade"
import { NodeInteraction } from "../../../stores/sharedView/sharedView.write.facade"
import { NO_EXTENSION, OTHER_EXTENSION } from "../../../util/fileExtension/fileExtensionCalculator"
import { MetricDistributionStore } from "../stores/metricDistribution.store"

@Injectable({
    providedIn: "root"
})
export class HighlightBuildingsByFileExtensionService {
    private readonly metricDistribution$ = this.metricDistributionStore.metricDistribution$
    private readonly fileExtensionsOfOthers = new Set<string>()
    private readonly fileExtensionsOfNone = new Set<string>()

    constructor(
        private readonly threeSceneService: ThreeSceneService,
        private readonly metricDistributionStore: MetricDistributionStore,
        private readonly nodeInteraction: NodeInteraction
    ) {
        this.metricDistribution$
            .pipe(
                distinct(),
                filter(it => !!it)
            )
            .subscribe(it => {
                this.fileExtensionsOfOthers.clear()
                for (const other of it.others) {
                    this.fileExtensionsOfOthers.add(other.fileExtension)
                }

                this.fileExtensionsOfNone.clear()
                for (const none of it.none) {
                    this.fileExtensionsOfNone.add(none.fileExtension)
                }
            })
    }

    highlightExtension(hoveredExtension: string) {
        this.nodeInteraction.hoverFileExtensions(this.extensionsIn(hoveredExtension))
        switch (hoveredExtension) {
            case OTHER_EXTENSION:
                this.threeSceneService.highlightBuildingsByExtension(this.fileExtensionsOfOthers)
                break
            case NO_EXTENSION:
                this.threeSceneService.highlightBuildingsWithoutExtensions()
                break
            default:
                this.threeSceneService.highlightBuildingsByExtension(new Set([hoveredExtension]))
                break
        }
    }

    clearHighlightingOnFileExtensions() {
        this.nodeInteraction.hoverFileExtensions([])
        this.threeSceneService.applyClearHighlights()
    }

    private extensionsIn(hoveredExtension: string): string[] {
        return hoveredExtension === OTHER_EXTENSION ? [...this.fileExtensionsOfOthers] : [hoveredExtension]
    }
}
