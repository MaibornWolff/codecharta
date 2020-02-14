import { StoreService, StoreSubscriber } from "../../store.service"
import { IRootScopeService } from "angular"
import { FilesSelectionActions } from "./files.actions"
import _ from "lodash"
import { Files } from "../../../model/files"

export interface FilesSelectionSubscriber {
	onFilesSelectionChanged(files: Files)
}

export class FilesService implements StoreSubscriber {
	private static FILES_SELECTION_CHANGED_EVENT = "files-selection-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(FilesSelectionActions).includes(actionType)) {
			this.notifyFilesSelectionChanged(this.select())
		}
	}

	private select() {
		return this.storeService.getState().files
	}

	private notifyFilesSelectionChanged(newState: Files) {
		this.$rootScope.$broadcast(FilesService.FILES_SELECTION_CHANGED_EVENT, { files: newState })
	}

	public static subscribeToFilesSelection($rootScope: IRootScopeService, subscriber: FilesSelectionSubscriber) {
		$rootScope.$on(FilesService.FILES_SELECTION_CHANGED_EVENT, (event, data) => {
			subscriber.onFilesSelectionChanged(data.files)
		})
	}
}
