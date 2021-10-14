import "./unfocusButton.component.scss"
import { IRootScopeService } from "angular"
import { focusNode, unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { StoreService } from "../../state/store.service"
// import { BuildingRightClickedEventSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
// import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { NodeContextMenuController } from "../nodeContextMenu/nodeContextMenu.component"
import { IsLoadingFileService, IsLoadingFileSubscriber } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"
import { FocusedNodePathService, FocusNodeSubscriber } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.service"

export class UnfocusButtonController implements IsLoadingFileSubscriber, FocusNodeSubscriber {
	onFocusNode(focusedNodePath: string) {
		if (focusedNodePath && !this._viewModel.focusedNodes.includes(focusedNodePath)) {
			this._viewModel.focusedNodes.push(focusedNodePath)
		}
	}
	private _viewModel: {
		isLoadingFile: boolean
		isNodeFocused: boolean
		isParentFocused: boolean
		focusedNodes: string[]
	} = {
		isLoadingFile: false,
		isNodeFocused: false,
		isParentFocused: false,
		focusedNodes: []
	}

	// @ts-ignore
	private isNodeFocused: boolean
	// @ts-ignore
	private isParentFocused: boolean

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		IsLoadingFileService.subscribe(this.$rootScope, this)
		FocusedNodePathService.subscribeToFocusNode(this.$rootScope, this)
	}

	removeFocusedNode(removeAll = false) {
		this.storeService.dispatch(unfocusNode())
		if (!removeAll) {
			this._viewModel.focusedNodes.pop()
			const lastFocusedNode = this._viewModel.focusedNodes[this._viewModel.focusedNodes.length - 1]
			this.storeService.dispatch(focusNode(lastFocusedNode))
		} else {
			this._viewModel.focusedNodes = []
		}
		NodeContextMenuController.broadcastHideEvent(this.$rootScope)
	}

	onIsLoadingFileChanged(isLoadingFile: boolean) {
		this._viewModel.isLoadingFile = isLoadingFile
		this._viewModel.focusedNodes = []
	}
}

export const unfocusButtonComponent = {
	selector: "unfocusButtonComponent",
	template: require("./unfocusButton.component.html"),
	controller: UnfocusButtonController,
	bindings: { isNodeFocused: "<", isParentFocused: "<" }
}
