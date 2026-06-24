import { Injectable } from "@angular/core"
import { NO_EXTENSION, OTHER_EXTENSION } from "../../../util/fileExtension/fileExtensionCalculator"
import { ThreeSceneService } from "../../../ui/codeMap/threeViewer/threeSceneService"
import { MetricDistributionStore } from "../stores/metricDistribution.store"
import { distinct, filter } from "rxjs"

@Injectable({
    providedIn: "root"
})
export class HighlightBuildingsByFileExtensionService {
    private readonly metricDistribution$ = this.metricDistributionStore.metricDistribution$
    private readonly fileExtensionsOfOthers = new Set<string>()
    private readonly fileExtensionsOfNone = new Set<string>()

    constructor(
        private readonly threeSceneService: ThreeSceneService,
        private readonly metricDistributionStore: MetricDistributionStore
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
        this.threeSceneService.applyClearHighlights()
    }
}
