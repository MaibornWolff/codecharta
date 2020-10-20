import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ExperimentalFeaturesEnabledActions } from "./experimentalFeaturesEnabled.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface ExperimentalFeaturesEnabledSubscriber {
	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean)
}

export class ExperimentalFeaturesEnabledService implements StoreSubscriber {
	private static EXPERIMENTAL_FEATURES_ENABLED_CHANGED_EVENT = "experimental-features-enabled-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ExperimentalFeaturesEnabledActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.experimentalFeaturesEnabled
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(ExperimentalFeaturesEnabledService.EXPERIMENTAL_FEATURES_ENABLED_CHANGED_EVENT, {
			experimentalFeaturesEnabled: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ExperimentalFeaturesEnabledSubscriber) {
		$rootScope.$on(ExperimentalFeaturesEnabledService.EXPERIMENTAL_FEATURES_ENABLED_CHANGED_EVENT, (_event_, data) => {
			subscriber.onExperimentalFeaturesEnabledChanged(data.experimentalFeaturesEnabled)
		})
	}
}
