import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SearchPatternActions } from "./searchPattern.actions"
import _ from "lodash"

export interface SearchPatternSubscriber {
	onSearchPatternChanged(searchPattern: string)
}

export class SearchPatternService implements StoreSubscriber {
	private static SEARCH_PATTERN_CHANGED_EVENT = "search-pattern-changed"
	private static DEBOUNCE_TIME = 400
	private readonly notifyWithDebounce: (newState: string) => void

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)

		this.notifyWithDebounce = _.debounce((newState: string) => {
			this.notify(newState)
		}, SearchPatternService.DEBOUNCE_TIME)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(SearchPatternActions).includes(actionType)) {
			this.notifyWithDebounce(this.select())
		}
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
