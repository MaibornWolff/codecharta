import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { FocusedNodePathActions, unfocusNode } from "./focusedNodePath.actions"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"

export interface FocusNodeSubscriber {
	onFocusNode(focusedNodePath: string)
}

export interface UnfocusNodeSubscriber {
	onUnfocusNode()
}

export class FocusedNodePathService implements StoreSubscriber, FilesSelectionSubscriber {
	private static FOCUS_NODE_EVENT = "focus-node"
	private static UNFOCUS_NODE_EVENT = "unfocus-node"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (actionType === FocusedNodePathActions.FOCUS_NODE) {
			this.notifyFocus(this.select())
		} else if (actionType === FocusedNodePathActions.UNFOCUS_NODE) {
			this.notifyUnfocus()
		}
	}

	onFilesSelectionChanged() {
		if (this.storeService.getState().dynamicSettings.focusedNodePath) {
			this.reset()
		}
	}

	reset() {
		this.storeService.dispatch(unfocusNode())
	}

	private select() {
		return this.storeService.getState().dynamicSettings.focusedNodePath
	}

	private notifyFocus(newState: string) {
		this.$rootScope.$broadcast(FocusedNodePathService.FOCUS_NODE_EVENT, { focusedNodePath: newState })
	}

	private notifyUnfocus() {
		this.$rootScope.$broadcast(FocusedNodePathService.UNFOCUS_NODE_EVENT)
	}

	static subscribeToFocusNode($rootScope: IRootScopeService, subscriber: FocusNodeSubscriber) {
		$rootScope.$on(FocusedNodePathService.FOCUS_NODE_EVENT, (_event, data) => {
			subscriber.onFocusNode(data.focusedNodePath)
		})
	}

	static subscribeToUnfocusNode($rootScope: IRootScopeService, subscriber: UnfocusNodeSubscriber) {
		$rootScope.$on(FocusedNodePathService.UNFOCUS_NODE_EVENT, () => {
			subscriber.onUnfocusNode()
		})
	}
}
