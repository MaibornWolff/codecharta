import { Component, Inject, Input, OnChanges, SimpleChanges } from "@angular/core"
import { CodeMapNode } from "../../../codeCharta.model"
import { ThreeSceneServiceToken } from "../../../services/ajs-upgraded-providers"
import { State } from "../../../state/angular-redux/state"
import { ThreeSceneService } from "../../codeMap/threeViewer/threeSceneService"

@Component({
	selector: "cc-highlight-buttons",
	template: require("./highlightButtons.component.html")
})
export class HighlightButtonsComponent implements OnChanges {
	@Input() codeMapNode: CodeMapNode

	isHighlighted: boolean

	constructor(@Inject(ThreeSceneServiceToken) private threeSceneService: ThreeSceneService, @Inject(State) private state: State) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.codeMapNode) this.isHighlighted = this.calculateIsHighlighted()
	}

	addNodeToConstantHighlight() {
		this.threeSceneService.addNodeAndChildrenToConstantHighlight(this.codeMapNode)
	}

	removeNodeFromConstantHighlight() {
		this.threeSceneService.removeNodeAndChildrenFromConstantHighlight(this.codeMapNode)
	}

	private calculateIsHighlighted() {
		if (!this.codeMapNode) return false

		const { lookUp } = this.state.getValue()
		const codeMapBuilding = lookUp.idToBuilding.get(this.codeMapNode.id)
		if (!codeMapBuilding) return false

		return this.threeSceneService.getConstantHighlight().has(codeMapBuilding.id)
	}
}
