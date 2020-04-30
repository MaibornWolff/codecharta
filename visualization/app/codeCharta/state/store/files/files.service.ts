import { StoreService, StoreSubscriber } from "../../store.service"
import { IRootScopeService } from "angular"
import { FilesSelectionActions } from "./files.actions"
import { isActionOfType } from "../../../util/reduxHelper"
import { FileState } from "../../../codeCharta.model"

export interface FilesSelectionSubscriber {
	onFilesSelectionChanged(files: FileState[])
}

export class FilesService implements StoreSubscriber {
	private static FILES_SELECTION_CHANGED_EVENT = "files-selection-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, FilesSelectionActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().files
	}

	private notify(newState: FileState[]) {
		this.$rootScope.$broadcast(FilesService.FILES_SELECTION_CHANGED_EVENT, { files: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: FilesSelectionSubscriber) {
		$rootScope.$on(FilesService.FILES_SELECTION_CHANGED_EVENT, (event, data) => {
			subscriber.onFilesSelectionChanged(data.files)
		})
	}
}
