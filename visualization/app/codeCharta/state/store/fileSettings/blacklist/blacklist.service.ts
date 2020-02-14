import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { BlacklistItem } from "../../../../model/codeCharta.model"
import { BlacklistActions, setBlacklist } from "./blacklist.actions"
import _ from "lodash"
import { getMergedBlacklist } from "./blacklist.merger"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { Files } from "../../../../model/files"

export interface BlacklistSubscriber {
	onBlacklistChanged(blacklist: BlacklistItem[])
}

export class BlacklistService implements StoreSubscriber, FilesSelectionSubscriber {
	private static BLACKLIST_CHANGED_EVENT = "blacklist-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType) {
		if (_.values(BlacklistActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onFilesSelectionChanged(files: Files) {
		this.merge(files)
	}

	private merge(files: Files) {
		const visibleFiles = files.getVisibleFileStates().map(x => x.file)
		const withUpdatedPath = files.isPartialState()
		const newBlacklist = getMergedBlacklist(visibleFiles, withUpdatedPath)
		this.storeService.dispatch(setBlacklist(newBlacklist))
	}

	private select() {
		return this.storeService.getState().fileSettings.blacklist
	}

	private notify(newState: BlacklistItem[]) {
		this.$rootScope.$broadcast(BlacklistService.BLACKLIST_CHANGED_EVENT, { blacklist: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: BlacklistSubscriber) {
		$rootScope.$on(BlacklistService.BLACKLIST_CHANGED_EVENT, (event, data) => {
			subscriber.onBlacklistChanged(data.blacklist)
		})
	}
}
