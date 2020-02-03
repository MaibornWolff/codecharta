import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MarkedPackagesActions, setMarkedPackages } from "./markedPackages.actions"
import _ from "lodash"
import { FileState, MarkedPackage } from "../../../../codeCharta.model"
import { FileStateHelper } from "../../../../util/fileStateHelper"
import { FileStateService, FileStateSubscriber } from "../../../fileState.service"
import { getMergedMarkedPackages } from "./markedPackages.reset"

export interface MarkedPackagesSubscriber {
	onMarkedPackagesChanged(markedPackages: MarkedPackage[])
}

export class MarkedPackagesService implements StoreSubscriber, FileStateSubscriber {
	private static MARKED_PACKAGES_CHANGED_EVENT = "marked-packages-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(MarkedPackagesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onFileStatesChanged(fileStates: FileState[]) {
		this.merge(fileStates)
	}

	public merge(fileStates: FileState[]) {
		const visibleFiles = FileStateHelper.getVisibleFileStates(fileStates).map(x => x.file)
		const withUpdatedPath = FileStateHelper.isPartialState(fileStates)
		const newMarkedPackages = getMergedMarkedPackages(visibleFiles, withUpdatedPath)
		this.storeService.dispatch(setMarkedPackages(newMarkedPackages))
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
