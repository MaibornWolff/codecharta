import "./attributeSideBar.component.scss"
import { KeyValuePair } from "../../codeCharta.model"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { BuildingSelectedEventSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"

export class AttributeSideBarDeltasController implements BuildingSelectedEventSubscriber {
	// tslint:disable-next-line
	private attributekey: string // variable set throught component binding

	private _viewModel: {
		deltas: KeyValuePair
	} = {
		deltas: null
	}

	constructor(private $rootScope: IRootScopeService, private threeSceneService: ThreeSceneService) {
		CodeMapMouseEventService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		this.onBuildingSelected(this.threeSceneService.getSelectedBuilding())
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		if (selectedBuilding) {
			this._viewModel.deltas = selectedBuilding.node.deltas
		}
	}
}

export const attributeSideBarDeltasComponent = {
	selector: "attributeSideBarDeltasComponent",
	template: require("./attributeSideBar.deltas.component.html"),
	controller: AttributeSideBarDeltasController,
	bindings: {
		attributekey: "="
	}
}
