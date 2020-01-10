import "./unfocusButton.component.scss"
import {
	FocusedNodePathService,
	FocusNodeSubscriber,
	UnfocusNodeSubscriber
} from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { IRootScopeService } from "angular"
import { unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { StoreService } from "../../state/store.service"

export class UnfocusButtonController implements FocusNodeSubscriber, UnfocusNodeSubscriber {
	private _viewModel: {
		isNodeFocused: boolean
	} = {
		isNodeFocused: false
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		FocusedNodePathService.subscribeToFocusNode(this.$rootScope, this)
		FocusedNodePathService.subscribeToUnfocusNode(this.$rootScope, this)
	}

	public onFocusNode(focusedNodePath: string) {
		this._viewModel.isNodeFocused = true
	}

	public onUnfocusNode() {
		this._viewModel.isNodeFocused = false
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
