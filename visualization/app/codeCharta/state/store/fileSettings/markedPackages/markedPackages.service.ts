import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MarkedPackagesActions, setMarkedPackages } from "./markedPackages.actions"
import _ from "lodash"
import { MarkedPackage } from "../../../../model/codeCharta.model"
import { getMergedMarkedPackages } from "./markedPackages.merger"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { Files } from "../../../../model/files"

export interface MarkedPackagesSubscriber {
	onMarkedPackagesChanged(markedPackages: MarkedPackage[])
}

export class MarkedPackagesService implements StoreSubscriber, FilesSelectionSubscriber {
	private static MARKED_PACKAGES_CHANGED_EVENT = "marked-packages-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribeToFilesSelection(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(MarkedPackagesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onFilesSelectionChanged(fileStates: Files) {
		this.merge(fileStates)
	}

	private merge(files: Files) {
		const visibleFiles = files.getVisibleFileStates().map(x => x.file)
		const withUpdatedPath = files.isPartialState()
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
