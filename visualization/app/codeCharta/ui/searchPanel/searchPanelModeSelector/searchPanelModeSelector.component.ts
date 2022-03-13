import "./searchPanelModeSelector.component.scss"
import { SearchPanelMode } from "../searchPanel.component"
import { Component, Inject, Input } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { Observable } from "rxjs"
import { hideBlacklistItemsIndicatorSelector } from "./hideBlacklistItemsIndicator.selector"

@Component({
	selector: "cc-search-panel-mode-selector",
	template: require("./searchPanelModeSelector.component.html")
})
export class SearchPanelModeSelectorComponent {
	@Input() searchPanelMode: SearchPanelMode
	@Input() updateSearchPanelMode: (SearchPanelMode: SearchPanelMode) => void

	hideBlacklistItemsIndicator$: Observable<boolean>

	constructor(@Inject(Store) store: Store) {
		this.hideBlacklistItemsIndicator$ = store.select(hideBlacklistItemsIndicatorSelector)
	}
}
