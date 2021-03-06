import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SearchPatternActions, setSearchPattern } from "./searchPattern.actions"
import { FilesService, FilesSelectionSubscriber } from "../../files/files.service"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface SearchPatternSubscriber {
	onSearchPatternChanged(searchPattern: string)
}

export class SearchPatternService implements StoreSubscriber, FilesSelectionSubscriber {
	private static SEARCH_PATTERN_CHANGED_EVENT = "search-pattern-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, SearchPatternActions)) {
			this.notify(this.select())
		}
	}

	onFilesSelectionChanged() {
		this.storeService.dispatch(setSearchPattern())
	}

	private select() {
		return this.storeService.getState().dynamicSettings.searchPattern
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(SearchPatternService.SEARCH_PATTERN_CHANGED_EVENT, { searchPattern: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: SearchPatternSubscriber) {
		$rootScope.$on(SearchPatternService.SEARCH_PATTERN_CHANGED_EVENT, (_event, data) => {
			subscriber.onSearchPatternChanged(data.searchPattern)
		})
	}
}
