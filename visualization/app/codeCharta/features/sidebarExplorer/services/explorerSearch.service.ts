import { Injectable } from "@angular/core"
import { BlacklistType } from "../../../codeCharta.model"
import { SearchPatternStore } from "../stores/searchPattern.store"

@Injectable({
    providedIn: "root"
})
export class ExplorerSearchService {
    constructor(private readonly searchPatternStore: SearchPatternStore) {}

    searchPattern$ = this.searchPatternStore.searchPattern$
    isSearchPatternEmpty$ = this.searchPatternStore.isSearchPatternEmpty$
    isFlattenPatternDisabled$ = this.searchPatternStore.isFlattenPatternDisabled$
    isExcludePatternDisabled$ = this.searchPatternStore.isExcludePatternDisabled$

    setSearchPattern(value: string) {
        this.searchPatternStore.setSearchPattern(value)
    }

    resetSearchPattern() {
        this.searchPatternStore.resetSearchPattern()
    }

    blacklistSearchPattern(type: BlacklistType) {
        this.searchPatternStore.blacklistSearchPattern(type)
    }
}
