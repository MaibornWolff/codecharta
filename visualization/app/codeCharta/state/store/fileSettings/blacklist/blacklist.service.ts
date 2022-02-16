import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { BlacklistItem } from "../../../../codeCharta.model"
import { BlacklistActions, setBlacklist } from "./blacklist.actions"
import { getMergedBlacklist } from "./blacklist.merger"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { isActionOfType } from "../../../../util/reduxHelper"
import { getVisibleFiles, getVisibleFileStates, isPartialState } from "../../../../model/files/files.helper"
import { FileState } from "../../../../model/files/files"
import { resultsInEmptyMap } from "../../../effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap"

export interface BlacklistSubscriber {
	onBlacklistChanged(blacklist: BlacklistItem[])
}

export class BlacklistService implements StoreSubscriber, FilesSelectionSubscriber {
	private static BLACKLIST_CHANGED_EVENT = "blacklist-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, BlacklistActions)) {
			this.notify(this.select())
		}
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.merge(files)
	}

	resultsInEmptyMap(blacklistItems: BlacklistItem[]) {
		const visibleFiles = getVisibleFileStates(this.storeService.getState().files)
		const blacklist = this.storeService.getState().fileSettings.blacklist
		return resultsInEmptyMap(visibleFiles, blacklist, blacklistItems)
	}

	private merge(files: FileState[]) {
		const visibleFiles = getVisibleFiles(files)
		const withUpdatedPath = isPartialState(files)
		const newBlacklist = getMergedBlacklist(visibleFiles, withUpdatedPath)
		this.storeService.dispatch(setBlacklist(newBlacklist))
	}

	private select() {
		return this.storeService.getState().fileSettings.blacklist
	}

	private notify(newState: BlacklistItem[]) {
		this.$rootScope.$broadcast(BlacklistService.BLACKLIST_CHANGED_EVENT, { blacklist: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: BlacklistSubscriber) {
		$rootScope.$on(BlacklistService.BLACKLIST_CHANGED_EVENT, (_event_, data) => {
			subscriber.onBlacklistChanged(data.blacklist)
		})
	}
}
