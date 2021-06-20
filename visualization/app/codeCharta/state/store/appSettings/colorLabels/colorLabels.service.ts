import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ColorLabelsActions } from "./colorLabels.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { colorLabelOptions } from "../../../../codeCharta.model"

export interface ColorLabelsSubscriber {
	onColorLabelsChanged(colorLabels: colorLabelOptions)
}

export class ColorLabelsService implements StoreSubscriber {
	private static COLOR_LABELS_CHANGED_EVENT = "color-labels-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ColorLabelsActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.colorLabels
	}

	private notify(newState: colorLabelOptions) {
		this.$rootScope.$broadcast(ColorLabelsService.COLOR_LABELS_CHANGED_EVENT, { colorLabels: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ColorLabelsSubscriber) {
		$rootScope.$on(ColorLabelsService.COLOR_LABELS_CHANGED_EVENT, (_event_, data) => {
			subscriber.onColorLabelsChanged(data.colorLabels)
		})
	}
}
