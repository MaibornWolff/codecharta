import { IRootScopeService } from "angular"
import { StoreService, StoreSubscriber } from "../../state/store.service"
import { isActionOfType } from "../../util/reduxHelper"
import { ClipboardEnabledActions } from "./clipboardEnabled.actions"

export interface ClipboardEnabledSubscriber {
	onClipboardEnabledChanged(clipboardEnabled: boolean)
}

export class ClipboardEnabledService implements StoreSubscriber {
	private static CLIPBOARD_ENABLED_CHANGED_EVENT = "clipboard-enabled-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ClipboardEnabledActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.clipboardEnabled
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(ClipboardEnabledService.CLIPBOARD_ENABLED_CHANGED_EVENT, {
			clipboardEnabled: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ClipboardEnabledSubscriber) {
		$rootScope.$on(ClipboardEnabledService.CLIPBOARD_ENABLED_CHANGED_EVENT, (_event_, data) => {
			subscriber.onClipboardEnabledChanged(data.clipboardEnabled)
		})
	}
}
