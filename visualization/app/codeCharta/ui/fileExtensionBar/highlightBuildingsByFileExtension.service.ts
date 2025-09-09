import { Injectable } from "@angular/core"
import { NO_EXTENSION, OTHER_EXTENSION } from "./selectors/fileExtensionCalculator"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { metricDistributionSelector } from "./selectors/metricDistribution.selector"
import { CcState } from "../../codeCharta.model"
import { Store } from "@ngrx/store"
import { distinct, filter } from "rxjs"

@Injectable({
    providedIn: "root"
})
export class HighlightBuildingsByFileExtensionService {
    private readonly metricDistribution$ = this.store.select(metricDistributionSelector)
    private readonly fileExtensionsOfOthers = new Set<string>()
    private readonly fileExtensionsOfNone = new Set<string>()

    constructor(
        private readonly threeSceneService: ThreeSceneService,
        private readonly store: Store<CcState>
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
        this.threeSceneService.applyClearHightlights()
    }
}
