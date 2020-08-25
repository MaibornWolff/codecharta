import "./unfocusButton.component.scss"
import { IRootScopeService } from "angular"
import { unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { StoreService } from "../../state/store.service"
import { BuildingRightClickedEventSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

export class UnfocusButtonController implements BuildingRightClickedEventSubscriber {
	private _viewModel: {
		isNodeFocused: boolean
		isParentFocused: boolean
	} = {
		isNodeFocused: false,
		isParentFocused: false
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		CodeMapMouseEventService.subscribeToBuildingRightClickedEvents(this.$rootScope, this)
	}

	public onBuildingRightClicked(building: CodeMapBuilding) {
		const codeMapNode = this.storeService.getState().lookUp.idToNode.get(building.node.id)
		const focusedNodePath = this.storeService.getState().dynamicSettings.focusedNodePath
		this._viewModel.isNodeFocused = codeMapNode.path === focusedNodePath
		this._viewModel.isParentFocused = codeMapNode.path.includes(focusedNodePath) && codeMapNode.path !== focusedNodePath
	}

	public removeFocusedNode() {
		this.storeService.dispatch(unfocusNode())
	}
}

export const unfocusButtonComponent = {
	selector: "unfocusButtonComponent",
	template: require("./unfocusButton.component.html"),
	controller: UnfocusButtonController
}
