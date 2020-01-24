import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { FilesActions } from "./files.actions"
import _ from "lodash"
import { Files } from "../../../../model/files"

export interface FilesSubscriber {
	onFilesChanged(files: Files)
}

export class FilesService implements StoreSubscriber {
	private static FILES_CHANGED_EVENT = "files-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(FilesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().fileSettings.files
	}

	private notify(newState: Files) {
		this.$rootScope.$broadcast(FilesService.FILES_CHANGED_EVENT, { files: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: FilesSubscriber) {
		$rootScope.$on(FilesService.FILES_CHANGED_EVENT, (event, data) => {
			subscriber.onFilesChanged(data.files)
		})
	}
}
