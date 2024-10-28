import { SearchPanelMode } from "../searchPanel.component"
import { Component, Input } from "@angular/core"
import { Observable } from "rxjs"
import { hideBlacklistItemsIndicatorSelector } from "./hideBlacklistItemsIndicator.selector"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"

@Component({
    selector: "cc-search-panel-mode-selector",
    templateUrl: "./searchPanelModeSelector.component.html",
    styleUrls: ["./searchPanelModeSelector.component.scss"]
})
export class SearchPanelModeSelectorComponent {
    @Input() searchPanelMode: SearchPanelMode
    @Input() updateSearchPanelMode: (SearchPanelMode: SearchPanelMode) => void

    hideBlacklistItemsIndicator$: Observable<boolean>

    constructor(store: Store<CcState>) {
        this.hideBlacklistItemsIndicator$ = store.select(hideBlacklistItemsIndicatorSelector)
    }
}
