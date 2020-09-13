import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MarkedPackagesActions, setMarkedPackages } from "./markedPackages.actions"
import { MarkedPackage } from "../../../../codeCharta.model"
import { getMergedMarkedPackages } from "./markedPackages.merger"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { isActionOfType } from "../../../../util/reduxHelper"
import { getVisibleFiles, isPartialState } from "../../../../model/files/files.helper"
import { FileState } from "../../../../model/files/files"

export interface MarkedPackagesSubscriber {
	onMarkedPackagesChanged(markedPackages: MarkedPackage[])
}

export class MarkedPackagesService implements StoreSubscriber, FilesSelectionSubscriber {
	private static MARKED_PACKAGES_CHANGED_EVENT = "marked-packages-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, MarkedPackagesActions)) {
			this.notify(this.select())
		}
	}

	public onFilesSelectionChanged(fileStates: FileState[]) {
		this.merge(fileStates)
	}

	private merge(files: FileState[]) {
		const visibleFiles = getVisibleFiles(files)
		const withUpdatedPath = isPartialState(files)
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
		$rootScope.$on(MarkedPackagesService.MARKED_PACKAGES_CHANGED_EVENT, (_event_, data) => {
			subscriber.onMarkedPackagesChanged(data.markedPackages)
		})
	}
}
