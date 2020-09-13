import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { IsLoadingFileActions } from "./isLoadingFile.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface IsLoadingFileSubscriber {
	onIsLoadingFileChanged(isLoadingFile: boolean)
}

export class IsLoadingFileService implements StoreSubscriber {
	private static IS_LOADING_FILE_CHANGED_EVENT = "is-loading-file-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, IsLoadingFileActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.isLoadingFile
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(IsLoadingFileService.IS_LOADING_FILE_CHANGED_EVENT, { isLoadingFile: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: IsLoadingFileSubscriber) {
		$rootScope.$on(IsLoadingFileService.IS_LOADING_FILE_CHANGED_EVENT, (_event_, data) => {
			subscriber.onIsLoadingFileChanged(data.isLoadingFile)
		})
	}
}
