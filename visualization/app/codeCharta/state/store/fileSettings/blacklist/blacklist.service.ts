import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { BlacklistItem, FileState } from "../../../../codeCharta.model"
import { BlacklistActions, setBlacklist } from "./blacklist.actions"
import _ from "lodash"
import { getMergedBlacklist } from "./blacklist.merger"
import { FileStateService, FileStateSubscriber } from "../../../fileState.service"
import { FileStateHelper } from "../../../../util/fileStateHelper"

export interface BlacklistSubscriber {
	onBlacklistChanged(blacklist: BlacklistItem[])
}

export class BlacklistService implements StoreSubscriber, FileStateSubscriber {
	private static BLACKLIST_CHANGED_EVENT = "blacklist-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType) {
		if (_.values(BlacklistActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onFileStatesChanged(fileStates: FileState[]) {
		this.merge(fileStates)
	}

	private merge(fileStates: FileState[]) {
		const visibleFiles = FileStateHelper.getVisibleFileStates(fileStates).map(x => x.file)
		const withUpdatedPath = FileStateHelper.isPartialState(fileStates)
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
