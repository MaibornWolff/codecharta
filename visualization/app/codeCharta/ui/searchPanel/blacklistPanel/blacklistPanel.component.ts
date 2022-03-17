import "./blacklistPanel.component.scss"
import { Component, Inject } from "@angular/core"
import { BlacklistItem, BlacklistType } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
import { removeBlacklistItem } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { createBlacklistItemSelector } from "./createBlacklistItemSelector"

@Component({
	selector: "cc-blacklist-panel",
	template: require("./blacklistPanel.component.html")
})
export class BlacklistPanelComponent {
	flattenedItems$ = this.store.select(createBlacklistItemSelector(BlacklistType.flatten))
	excludedItems$ = this.store.select(createBlacklistItemSelector(BlacklistType.exclude))

	constructor(@Inject(Store) private store: Store) {}

	removeBlacklistEntry(item: BlacklistItem) {
		this.store.dispatch(removeBlacklistItem(item))
	}
}
