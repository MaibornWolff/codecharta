import { Component } from "@angular/core"
import { MetricDistribution, FileExtensionCalculator } from "./selectors/fileExtensionCalculator"
import { metricDistributionSelector } from "./selectors/metricDistribution.selector"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"

@Component({
    selector: "cc-file-extension-bar",
    templateUrl: "./fileExtensionBar.component.html",
    styleUrls: ["./fileExtensionBar.component.scss"]
})
export class FileExtensionBarComponent {
    showAbsoluteValues = false
    showDetails = false
    metricDistribution: MetricDistribution[]

    constructor(
        private store: Store<CcState>,
        private threeSceneService: ThreeSceneService
    ) {
        this.store.select(metricDistributionSelector).subscribe(metricDistribution => {
            this.metricDistribution = metricDistribution
        })
    }

    onHoverFileExtensionBar(hoveredExtension: string) {
        const visibleFileExtensions = new Set()
        for (const metric of this.metricDistribution) {
            if (metric.fileExtension !== "other") {
                visibleFileExtensions.add(metric.fileExtension)
            }
        }

        for (const building of this.threeSceneService.getMapMesh().getMeshDescription().buildings) {
            if (building.node.isLeaf) {
                const buildingExtension = FileExtensionCalculator.estimateFileExtension(building.node.name)
                if (
                    buildingExtension === hoveredExtension ||
                    (hoveredExtension === "other" && !visibleFileExtensions.has(buildingExtension))
                ) {
                    this.threeSceneService.addBuildingToHighlightingList(building)
                }
            }
        }

        this.threeSceneService.highlightBuildings()
    }

    onUnhoverFileExtensionBar() {
        this.threeSceneService.clearHighlight()
    }

    toggleShowDetails() {
        this.showDetails = !this.showDetails
    }

    toggleShowAbsoluteValues() {
        this.showAbsoluteValues = !this.showAbsoluteValues
    }
}
