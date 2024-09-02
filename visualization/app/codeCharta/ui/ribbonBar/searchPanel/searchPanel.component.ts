import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta/codeCharta.model"
import { isSearchPanelPinnedSelector } from "../../../state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.selector"
import { Subscription } from "rxjs"
import { RibbonBarPanelComponent } from "../ribbonBarPanel/ribbonBarPanel.component"

export type SearchPanelMode = "treeView" | "blacklist" | "minimized"

@Component({
    selector: "cc-search-panel",
    templateUrl: "./searchPanel.component.html",
    styleUrls: ["./searchPanel.component.scss"]
})
export class SearchPanelComponent implements OnInit, OnDestroy {
    searchPanelMode: SearchPanelMode = "minimized"
    isSearchPanelPinned: boolean
    isSearchPanelPinnedSubscription: Subscription

    @ViewChild(RibbonBarPanelComponent)
    private panelRef!: RibbonBarPanelComponent

    constructor(private readonly store: Store<CcState>) {}

    ngOnInit(): void {
        this.isSearchPanelPinnedSubscription = this.store.select(isSearchPanelPinnedSelector).subscribe(isSearchPanelPinned => {
            this.isSearchPanelPinned = isSearchPanelPinned
        })
    }

    ngOnDestroy(): void {
        this.isSearchPanelPinnedSubscription.unsubscribe()
    }

    updateSearchPanelMode = (searchPanelMode: SearchPanelMode) => {
        this.searchPanelMode = this.searchPanelMode === searchPanelMode ? "minimized" : searchPanelMode
        this.panelRef.isExpanded = this.searchPanelMode !== "minimized"
    }

    onToggleSettings($event: boolean) {
        this.searchPanelMode = $event ? "treeView" : "minimized"
    }
}
