import { Injectable, inject } from "@angular/core"
import { combineLatest } from "rxjs"
import { PreferencesReadWindow } from "../../../stores/preferences/preferences.read.facade"

@Injectable({
    providedIn: "root"
})
export class ExplorerSortService {
    private readonly preferencesReadWindow = inject(PreferencesReadWindow)

    sortState$ = combineLatest([this.preferencesReadWindow.sortingOrder$, this.preferencesReadWindow.sortingOrderAscending$])
}
