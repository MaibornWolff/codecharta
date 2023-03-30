import { Component, ViewEncapsulation } from "@angular/core"
import { setSearchPattern } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { isSearchPatternEmptySelector } from "./selectors/isSearchPatternEmpty.selector"
import { isFlattenPatternDisabledSelector } from "./selectors/isFlattenPatternDisabled.selector"
import { isExcludePatternDisabledSelector } from "./selectors/isExcludePatternDisabled.selector"
import { BlacklistType, State } from "../../../codeCharta.model"
import { blacklistSearchPattern } from "./blacklistSearchPattern.effect"
import { debounce } from "../../../util/debounce"
import { Store } from "@ngrx/store"

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
	setSearchPatternDebounced = debounce((event: Event) => this.setSearchPattern(event), 400)

	constructor(private store: Store<State>) {}

	setSearchPattern(event: Event) {
		const eventTarget = event.target as HTMLInputElement
		this.store.dispatch(setSearchPattern({ value: eventTarget.value }))
	}

	resetSearchPattern() {
		this.store.dispatch(setSearchPattern({ value: "" }))
	}

	blacklistSearchPattern(type: BlacklistType) {
		this.store.dispatch(blacklistSearchPattern(type))
	}
}
