import { Component, Inject, ViewEncapsulation } from "@angular/core"
import debounce from "lodash.debounce"
import { Store } from "../../../state/angular-redux/store"
import { setSearchPattern } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { isSearchPatternEmptySelector } from "./selectors/isSearchPatternEmpty.selector"
import { isFlattenPatternDisabledSelector } from "./selectors/isFlattenPatternDisabled.selector"
import { isExcludePatternDisabledSelector } from "./selectors/isExcludePatternDisabled.selector"
import { BlacklistType } from "../../../codeCharta.model"
import { blacklistSearchPattern } from "./blacklistSearchPattern.effect"

@Component({
	selector: "cc-search-bar",
	templateUrl: "./searchBar.component.html",
	styleUrls: ["./searchBar.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent {
	searchPattern$ = this.store.select(searchPatternSelector)
	isSearchPatternEmpty$ = this.store.select(isSearchPatternEmptySelector)
	isFlattenPatternDisabled$ = this.store.select(isFlattenPatternDisabledSelector)
	isExcludePatternDisabled$ = this.store.select(isExcludePatternDisabledSelector)
	setSearchPatternDebounced = debounce(this.setSearchPattern, 400)

	constructor(@Inject(Store) private store: Store) {}

	setSearchPattern(event: Event) {
		const eventTarget = event.target as HTMLInputElement
		this.store.dispatch(setSearchPattern(eventTarget.value))
	}

	resetSearchPattern() {
		this.store.dispatch(setSearchPattern())
	}

	blacklistSearchPattern(type: BlacklistType) {
		this.store.dispatch(blacklistSearchPattern(type))
	}
}
