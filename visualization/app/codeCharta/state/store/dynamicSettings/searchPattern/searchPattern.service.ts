import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SearchPatternActions, setSearchPattern } from "./searchPattern.actions"
import _ from "lodash"
import { FileStateService, FileStateServiceSubscriber } from "../../../fileState.service"
import { FileState } from "../../../../codeCharta.model"

export interface SearchPatternSubscriber {
	onSearchPatternChanged(searchPattern: string)
}

export class SearchPatternService implements StoreSubscriber, FileStateServiceSubscriber {
	private static SEARCH_PATTERN_CHANGED_EVENT = "search-pattern-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(SearchPatternActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this.reset()
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	public reset() {
		this.storeService.dispatch(setSearchPattern())
	}

	private select() {
		return this.storeService.getState().dynamicSettings.searchPattern
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(SearchPatternService.SEARCH_PATTERN_CHANGED_EVENT, { searchPattern: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SearchPatternSubscriber) {
		$rootScope.$on(SearchPatternService.SEARCH_PATTERN_CHANGED_EVENT, (event, data) => {
			subscriber.onSearchPatternChanged(data.searchPattern)
		})
	}
}
