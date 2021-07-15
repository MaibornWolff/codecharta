import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SharpnessModeActions } from "./sharpnessMode.actions"
import { SharpnessMode } from "../../../../codeCharta.model"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface SharpnessModeSubscriber {
	onSharpnessModeChanged(sharpnessMode: SharpnessMode)
}

export class SharpnessModeService implements StoreSubscriber {
	private static SHARPNESS_MODE_CHANGED_EVENT = "sharpness-mode-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, SharpnessModeActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.sharpnessMode
	}

	private notify(newState: SharpnessMode) {
		this.$rootScope.$broadcast(SharpnessModeService.SHARPNESS_MODE_CHANGED_EVENT, { sharpnessMode: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: SharpnessModeSubscriber) {
		$rootScope.$on(SharpnessModeService.SHARPNESS_MODE_CHANGED_EVENT, (_event, data) => {
			subscriber.onSharpnessModeChanged(data.sharpnessMode)
		})
	}
}
