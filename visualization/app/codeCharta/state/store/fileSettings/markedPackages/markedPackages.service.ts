import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MarkedPackagesActions } from "./markedPackages.actions"
import _ from "lodash"

export interface MarkedPackagesSubscriber {
	onMarkedPackagesChanged(markedPackages: MarkedPackage[])
}

export class MarkedPackagesService implements StoreSubscriber {
	private static MARKED_PACKAGES_CHANGED_EVENT = "marked-packages-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(MarkedPackagesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().fileSettings.markedPackages
	}

	private notify(newState: MarkedPackage[]) {
		this.$rootScope.$broadcast(MarkedPackagesService.MARKED_PACKAGES_CHANGED_EVENT, { markedPackages: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MarkedPackagesSubscriber) {
		$rootScope.$on(MarkedPackagesService.MARKED_PACKAGES_CHANGED_EVENT, (event, data) => {
			subscriber.onMarkedPackagesChanged(data.markedPackages)
		})
	}
}
