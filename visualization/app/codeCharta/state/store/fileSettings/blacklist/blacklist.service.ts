import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { BlacklistItem } from "../../../../codeCharta.model"
import { BlacklistActions, removeLastBlacklistItem, setBlacklist } from "./blacklist.actions"
import { getMergedBlacklist } from "./blacklist.merger"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { isActionOfType } from "../../../../util/reduxHelper"
import { getVisibleFiles, isPartialState } from "../../../../model/files/files.helper"
import { FileState } from "../../../../model/files/files"
import { NodeDecorator } from "../../../../util/nodeDecorator"
import { CodeMapPreRenderService } from "../../../../ui/codeMap/codeMap.preRender.service"
import { DialogService } from "../../../../ui/dialog/dialog.service"
import { setIsLoadingMap } from "../../appSettings/isLoadingMap/isLoadingMap.actions"

export interface BlacklistSubscriber {
	onBlacklistChanged(blacklist: BlacklistItem[])
}

export class BlacklistService implements StoreSubscriber, FilesSelectionSubscriber {
	private static BLACKLIST_CHANGED_EVENT = "blacklist-changed"

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapPreRenderService: CodeMapPreRenderService,
		private dialogService: DialogService
	) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, BlacklistActions)) {
			if (
				!NodeDecorator.doesExclusionResultInEmptyMap(
					this.codeMapPreRenderService.getRenderMap(),
					this.storeService.getState().fileSettings.blacklist
				)
			) {
				this.storeService.dispatch(setIsLoadingMap(true))
				this.notify(this.select())
			} else {
				this.storeService.dispatch(removeLastBlacklistItem(), true)
				this.dialogService.showErrorDialog("Excluding all buildings is not possible.", "Blacklist Error")
			}
		}
	}

	public onFilesSelectionChanged(files: FileState[]) {
		this.merge(files)
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

	public static subscribe($rootScope: IRootScopeService, subscriber: BlacklistSubscriber) {
		$rootScope.$on(BlacklistService.BLACKLIST_CHANGED_EVENT, (event, data) => {
			subscriber.onBlacklistChanged(data.blacklist)
		})
	}
}
