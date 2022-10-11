import { Component, Inject, Input, OnChanges, SimpleChanges } from "@angular/core"
import { CodeMapNode } from "../../../../codeCharta.model"
import { IdToBuildingService } from "../../../../services/idToBuilding/idToBuilding.service"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"

@Component({
	selector: "cc-highlight-buttons",
	template: require("./highlightButtons.component.html")
})
export class HighlightButtonsComponent implements OnChanges {
	@Input() codeMapNode: Pick<CodeMapNode, "id">

	isHighlighted: boolean

	constructor(
		@Inject(ThreeSceneService) private threeSceneService: ThreeSceneService,
		@Inject(IdToBuildingService) private idToBuilding: IdToBuildingService
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.codeMapNode) {
			this.isHighlighted = this.calculateIsHighlighted()
		}
	}

	addNodeToConstantHighlight() {
		this.threeSceneService.addNodeAndChildrenToConstantHighlight(this.codeMapNode)
	}

	removeNodeFromConstantHighlight() {
		this.threeSceneService.removeNodeAndChildrenFromConstantHighlight(this.codeMapNode)
	}

	private calculateIsHighlighted() {
		if (!this.codeMapNode) {
			return false
		}

		const codeMapBuilding = this.idToBuilding.get(this.codeMapNode.id)
		if (!codeMapBuilding) {
			return false
		}

		return this.threeSceneService.getConstantHighlight().has(codeMapBuilding.id)
	}
}
