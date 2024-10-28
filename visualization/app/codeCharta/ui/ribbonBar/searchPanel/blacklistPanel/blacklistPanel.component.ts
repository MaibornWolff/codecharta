import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { BlacklistItem, CcState } from "../../../../codeCharta.model"
import { removeBlacklistItem } from "../../../../state/store/fileSettings/blacklist/blacklist.actions"
import { createBlacklistItemSelector } from "./createBlacklistItemSelector"
import { MatList, MatListItem } from "@angular/material/list"
import { MatTooltip } from "@angular/material/tooltip"
import { MatButton } from "@angular/material/button"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-blacklist-panel",
    templateUrl: "./blacklistPanel.component.html",
    styleUrls: ["./blacklistPanel.component.scss"],
    standalone: true,
    imports: [MatList, MatTooltip, MatListItem, MatButton, AsyncPipe]
})
export class BlacklistPanelComponent {
    flattenedItems$ = this.store.select(createBlacklistItemSelector("flatten"))
    excludedItems$ = this.store.select(createBlacklistItemSelector("exclude"))

    constructor(private store: Store<CcState>) {}

    removeBlacklistEntry(item: BlacklistItem) {
        this.store.dispatch(removeBlacklistItem({ item }))
    }
}
