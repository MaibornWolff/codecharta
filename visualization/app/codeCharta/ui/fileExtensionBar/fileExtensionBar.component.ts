import "./fileExtensionBar.component.scss"
import { MetricDistribution, FileExtensionCalculator } from "./selectors/fileExtensionCalculator"
import { Component, Inject } from "@angular/core"
import { metricDistributionSelector } from "./selectors/metricDistribution.selector"
import { onStoreChanged } from "../../state/angular-redux/onStoreChanged/onStoreChanged"
import { ThreeSceneServiceToken } from "../../services/ajs-upgraded-providers"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"

@Component({
	selector: "cc-file-extension-bar",
	template: require("./fileExtensionBar.component.html")
})
export class FileExtensionBarComponent {
	showAbsoluteValues = false
	showDetails = false
	metricDistribution: MetricDistribution[]

	constructor(@Inject(ThreeSceneServiceToken) private threeSceneService: ThreeSceneService) {
		onStoreChanged(metricDistributionSelector, (_, metricDistribution) => {
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
