import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MaxTreeMapFilesActions } from "./maxTreeMapFiles.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface MaxTreeMapFilesSubscriber {
	onMaxTreeMapFilesChanged(maxTreeMapFiles: number)
}

export class MaxTreeMapFilesService implements StoreSubscriber {
	private static MAX_TREE_MAP_FILES_CHANGED_EVENT = "max-tree-map-files-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, MaxTreeMapFilesActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.maxTreeMapFiles
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(MaxTreeMapFilesService.MAX_TREE_MAP_FILES_CHANGED_EVENT, { maxTreeMapFiles: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MaxTreeMapFilesSubscriber) {
		$rootScope.$on(MaxTreeMapFilesService.MAX_TREE_MAP_FILES_CHANGED_EVENT, (event, data) => {
			subscriber.onMaxTreeMapFilesChanged(data.maxTreeMapFiles)
		})
	}
}
