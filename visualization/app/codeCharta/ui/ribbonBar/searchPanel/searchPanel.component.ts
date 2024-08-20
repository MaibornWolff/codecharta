import { Component, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "app/codeCharta/codeCharta.model"
import { isSearchPanelPinnedSelector } from "../../../state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.selector"
import { Subscription } from "rxjs"

export type SearchPanelMode = "minimized" | "treeView" | "blacklist"

@Component({
    selector: "cc-search-panel",
    templateUrl: "./searchPanel.component.html",
    styleUrls: ["./searchPanel.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class SearchPanelComponent implements OnInit {
    searchPanelMode: SearchPanelMode = "minimized"
    isSearchPanelPinned: boolean
    isSearchPanelPinnedSubscription: Subscription

    constructor(private store: Store<CcState>) {}

    ngOnInit(): void {
        this.isSearchPanelPinnedSubscription = this.store.select(isSearchPanelPinnedSelector).subscribe(isSearchPanelPinned => {
            this.isSearchPanelPinned = isSearchPanelPinned
        })
    }

    ngOnDestroy(): void {
        this.isSearchPanelPinnedSubscription.unsubscribe()
    }

    updateSearchPanelMode = (searchPanelMode: SearchPanelMode) => {
        this.setSearchPanelMode(this.searchPanelMode === searchPanelMode ? "minimized" : searchPanelMode)
    }

    openSearchPanel() {
        this.setSearchPanelMode("treeView")
    }

    private closeSearchPanelOnOutsideClick = (event: MouseEvent) => {
        if (this.isOutside(event) && !this.isSearchPanelPinned) {
            this.setSearchPanelMode("minimized")
        }
    }

    private setSearchPanelMode(newMode: SearchPanelMode) {
        if (this.searchPanelMode === "minimized" && newMode !== "minimized") {
            document.addEventListener("mousedown", this.closeSearchPanelOnOutsideClick)
        }
        if (this.searchPanelMode !== "minimized" && newMode === "minimized") {
            document.removeEventListener("mousedown", this.closeSearchPanelOnOutsideClick)
        }
        this.searchPanelMode = newMode
    }

    private isOutside(event: MouseEvent) {
        return event
            .composedPath()
            .every(
                element =>
                    element["nodeName"] !== "CC-SEARCH-PANEL" &&
                    element["nodeName"] !== "COLOR-CHROME" &&
                    element["nodeName"] !== "MAT-OPTION" &&
                    element["id"] !== "codemap-context-menu"
            )
    }
}
