import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { RecentFilesActions } from "./recentFiles.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface RecentFilesSubscriber {
	onRecentFilesChanged(recentFiles: string[])
}

export class RecentFilesService implements StoreSubscriber {
	private static RECENT_FILES_CHANGED_EVENT = "recent-files-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, RecentFilesActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.recentFiles
	}

	private notify(newState: string[]) {
		this.$rootScope.$broadcast(RecentFilesService.RECENT_FILES_CHANGED_EVENT, { recentFiles: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: RecentFilesSubscriber) {
		$rootScope.$on(RecentFilesService.RECENT_FILES_CHANGED_EVENT, (_event, data) => {
			subscriber.onRecentFilesChanged(data.recentFiles)
		})
	}
}
