import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ColorModeActions } from "./colorMode.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { ColorMode } from "../../../../codeCharta.model"

export interface ColorModeSubscriber {
	onColorModeChanged(colorMode: ColorMode)
}

export class ColorModeService implements StoreSubscriber {
	private static COLOR_MODE_CHANGED_EVENT = "color-mode-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ColorModeActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.colorMode
	}

	private notify(newState: ColorMode) {
		this.$rootScope.$broadcast(ColorModeService.COLOR_MODE_CHANGED_EVENT, { colorMode: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ColorModeSubscriber) {
		$rootScope.$on(ColorModeService.COLOR_MODE_CHANGED_EVENT, (_event, data) => {
			subscriber.onColorModeChanged(data.colorMode)
		})
	}
}
