import { Injectable } from "@angular/core"
import { BlacklistItem } from "../../../codeCharta.model"
import { BlacklistStore } from "../stores/blacklist.store"

@Injectable({
    providedIn: "root"
})
export class ExplorerRulesService {
    constructor(private readonly blacklistStore: BlacklistStore) {}

    flattenRulesWithCount$ = this.blacklistStore.flattenRulesWithCount$
    excludeRulesWithCount$ = this.blacklistStore.excludeRulesWithCount$

    removeRule(item: BlacklistItem) {
        this.blacklistStore.removeBlacklistItem(item)
    }
}
