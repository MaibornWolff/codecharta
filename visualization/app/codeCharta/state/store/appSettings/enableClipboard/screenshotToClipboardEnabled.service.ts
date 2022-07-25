import { IRootScopeService } from "angular"
import { StoreService, StoreSubscriber } from "../../../store.service"
import { isActionOfType } from "../../../../util/reduxHelper"
import { ScreenshotToClipboardEnabledActions } from "./screenshotToClipboardEnabled.actions"

// todo delete
export interface ScreenshotToClipboardEnabledSubscriber {
	onScreenshotToClipboardEnabledChanged(screenshotToClipboardEnabled: boolean)
}

export class ScreenshotToClipboardEnabledService implements StoreSubscriber {
	private static SCREENSHOT_TO_CLIPBOARD_ENABLED_CHANGED_EVENT = "clipboard-enabled-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ScreenshotToClipboardEnabledActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.screenshotToClipboardEnabled
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(ScreenshotToClipboardEnabledService.SCREENSHOT_TO_CLIPBOARD_ENABLED_CHANGED_EVENT, {
			screenshotToClipboardEnabled: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ScreenshotToClipboardEnabledSubscriber) {
		$rootScope.$on(ScreenshotToClipboardEnabledService.SCREENSHOT_TO_CLIPBOARD_ENABLED_CHANGED_EVENT, (_event_, data) => {
			subscriber.onScreenshotToClipboardEnabledChanged(data.screenshotToClipboardEnabled)
		})
	}
}
