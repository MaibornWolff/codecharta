import { Component, ViewEncapsulation } from "@angular/core"
import { BlacklistItem } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { removeBlacklistItem } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { createBlacklistItemSelector } from "./createBlacklistItemSelector"

@Component({
	selector: "cc-blacklist-panel",
	templateUrl: "./blacklistPanel.component.html",
	styleUrls: ["./blacklistPanel.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class BlacklistPanelComponent {
	flattenedItems$ = this.store.select(createBlacklistItemSelector("flatten"))
	excludedItems$ = this.store.select(createBlacklistItemSelector("exclude"))

	constructor(private store: Store) {}

	removeBlacklistEntry(item: BlacklistItem) {
		this.store.dispatch(removeBlacklistItem(item))
	}
}
